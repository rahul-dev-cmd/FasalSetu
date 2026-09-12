"""
FastAPI Router for Feature 17: Deal Transactions & Lifecycle Tracking
======================================================================
Tracks the post-acceptance lifecycle of a deal — matching TransactionStatusScreen's
stage timeline — once an offer is accepted (listing status becomes sold).
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user, require_role, verify_negotiation_party
from app.models.user import User
from app.models.crop_listing import CropListing
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionAdvanceRequest,
    TransactionStage,
    TransactionResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transaction Status"])
my_transactions_router = APIRouter(prefix="/my", tags=["User Marketplace Views"])


def build_transaction_stages(tx: Transaction) -> List[TransactionStage]:
    """
    Constructs the 5-stage timeline matching the frontend TransactionStatusScreen:
    1. matched: completed at creation (offer was accepted)
    2. negotiated: completed at creation (shows agreed price)
    3. logistics: starts active, farmer confirms pickup -> completed
    4. payment: starts pending, becomes active when pickup completed, farmer confirms payment -> completed
    5. completed: starts pending, becomes completed when payment confirmed
    """
    agreed_price_str = f"₹{tx.agreed_price:g}/quintal"
    pickup_date_str = tx.pickup_target_date.strftime("%Y-%m-%d")
    payment_date_str = tx.payment_target_date.strftime("%Y-%m-%d")

    stages = [
        TransactionStage(
            stage="matched",
            status="completed",
            label="Matched",
            subtext="Offer accepted",
            target_date=None,
            completed_at=tx.created_at,
        ),
        TransactionStage(
            stage="negotiated",
            status="completed",
            label="Negotiated",
            subtext=f"Agreed at {agreed_price_str}",
            target_date=None,
            completed_at=tx.created_at,
        ),
        TransactionStage(
            stage="logistics",
            status=tx.logistics_status,
            label="Logistics & Pickup",
            subtext=f"Target pickup: {pickup_date_str}" if tx.logistics_status == "active" else "Pickup completed",
            target_date=tx.pickup_target_date,
            completed_at=tx.logistics_completed_at,
        ),
        TransactionStage(
            stage="payment",
            status=tx.payment_status,
            label="Payment Settlement",
            subtext=f"Target settlement: {payment_date_str}" if tx.payment_status in ["pending", "active"] else "Payment received",
            target_date=tx.payment_target_date,
            completed_at=tx.payment_completed_at,
        ),
        TransactionStage(
            stage="completed",
            status="completed" if tx.overall_status == "completed" else "pending",
            label="Completed",
            subtext="Deal closed & settlement finalized" if tx.overall_status == "completed" else "Pending final settlement",
            target_date=None,
            completed_at=tx.payment_completed_at if tx.overall_status == "completed" else None,
        ),
    ]
    return stages


def serialize_transaction(tx: Transaction) -> TransactionResponse:
    return TransactionResponse(
        id=tx.id,
        listing_id=tx.listing_id,
        offer_id=tx.offer_id,
        farmer_id=tx.farmer_id,
        buyer_id=tx.buyer_id,
        agreed_price=tx.agreed_price,
        pickup_target_date=tx.pickup_target_date,
        payment_target_date=tx.payment_target_date,
        logistics_status=tx.logistics_status,
        payment_status=tx.payment_status,
        overall_status=tx.overall_status,
        logistics_completed_at=tx.logistics_completed_at,
        payment_completed_at=tx.payment_completed_at,
        created_at=tx.created_at,
        updated_at=tx.updated_at,
        stages=build_transaction_stages(tx),
    )


@router.get(
    "/{listing_id}",
    response_model=TransactionResponse,
    summary="Get transaction status for a listing",
    responses={
        200: {"description": "Transaction status and stage timeline returned"},
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden: User is not an authorized party to this transaction"},
        404: {"description": "Listing or transaction not found"},
    },
)
def get_transaction_by_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the deal transaction status and stage timeline for a specific listing.
    Requires caller to be a verified party:
    - Owning farmer of the listing
    - Accepted buyer for the deal
    Non-parties receive 403 Forbidden.
    """
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found."
        )

    tx = db.query(Transaction).filter(Transaction.listing_id == listing_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No transaction found for listing id {listing_id}."
        )

    # Reuse shared negotiation party verification
    verify_negotiation_party(listing=listing, current_user=current_user, db=db)

    # In addition, if caller is a buyer, ensure they are the accepted buyer on this deal
    if current_user.role == "buyer" and int(tx.buyer_id) != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not the accepted buyer for this transaction."
        )

    if current_user.role == "farmer" and int(tx.farmer_id) != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not the owning farmer for this transaction."
        )

    if current_user.role not in ["farmer", "buyer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only deal parties (farmer or accepted buyer) can access this transaction."
        )

    return serialize_transaction(tx)


@router.patch(
    "/{listing_id}/advance",
    response_model=TransactionResponse,
    summary="Advance transaction stage",
    responses={
        200: {"description": "Stage advanced successfully"},
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden: Only owning farmer can advance stages"},
        404: {"description": "Listing or transaction not found"},
        409: {"description": "Conflict: Out of sequence action or already completed"},
    },
)
def advance_transaction_stage(
    listing_id: int,
    payload: TransactionAdvanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer")),
):
    """
    Advances a transaction through its lifecycle:
    - `confirm_pickup`: advances logistics from 'active' -> 'completed', and sets payment to 'active'.
    - `confirm_payment`: requires logistics to be 'completed' and payment to be 'active';
      advances payment to 'completed' and overall_status to 'completed'.
    - Returns 409 Conflict if actions are called out of sequence or on an already completed transaction.
    - Requires authenticated farmer JWT for the listing's owning farmer.
    """
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found."
        )

    tx = db.query(Transaction).filter(Transaction.listing_id == listing_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No transaction found for listing id {listing_id}."
        )

    # Must be the owning farmer
    if int(tx.farmer_id) != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the listing's owning farmer can advance transaction stages."
        )

    # Check if transaction is already completed
    if tx.overall_status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict: Transaction is already completed. No further stage advancements are permitted."
        )

    now = datetime.now(timezone.utc)

    if payload.action == "confirm_pickup":
        if tx.logistics_status != "active":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Conflict: Cannot confirm pickup because logistics status is '{tx.logistics_status}' (expected 'active')."
            )
        tx.logistics_status = "completed"
        tx.logistics_completed_at = now
        tx.payment_status = "active"
        tx.updated_at = now

    elif payload.action == "confirm_payment":
        if tx.logistics_status != "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conflict: Cannot confirm payment before pickup/logistics has been completed."
            )
        if tx.payment_status != "active":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Conflict: Cannot confirm payment because payment status is '{tx.payment_status}' (expected 'active')."
            )
        tx.payment_status = "completed"
        tx.payment_completed_at = now
        tx.overall_status = "completed"
        tx.updated_at = now

    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid action '{payload.action}'."
        )

    db.commit()
    db.refresh(tx)
    return serialize_transaction(tx)


@my_transactions_router.get(
    "/transactions",
    response_model=List[TransactionResponse],
    summary="List current user's transactions",
    responses={
        200: {"description": "User's transactions returned"},
        401: {"description": "Authentication required"},
    },
)
def get_my_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all transactions involving the authenticated user:
    - Farmer: transactions on their own listings.
    - Buyer: transactions on their accepted offers.
    Ordered by creation date descending.
    """
    if current_user.role == "farmer":
        txs = (
            db.query(Transaction)
            .filter(Transaction.farmer_id == current_user.id)
            .order_by(desc(Transaction.created_at))
            .all()
        )
    elif current_user.role == "buyer":
        txs = (
            db.query(Transaction)
            .filter(Transaction.buyer_id == current_user.id)
            .order_by(desc(Transaction.created_at))
            .all()
        )
    else:
        txs = []

    return [serialize_transaction(tx) for tx in txs]
