"""
FastAPI Router for Feature 7: Price Negotiation
===============================================
Endpoints for listing crops, submitting offers and counter-offers,
and accepting or rejecting negotiation offers.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.listing import (
    ListingCreate,
    ListingResponse,
    ListingDetailResponse,
    OfferCreate,
    OfferActionRequest,
    OfferResponse,
)
from app.services.negotiation_service import negotiation_service

router = APIRouter(prefix="/listings", tags=["Price Negotiation"])


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db)
):
    """
    Farmer creates a new crop listing with asking price, quantity, and unit.
    Initial status defaults to 'open'.
    """
    return negotiation_service.create_listing(db, payload)


@router.get("", response_model=List[ListingResponse])
def list_listings(
    crop: Optional[str] = Query(None, description="Optional crop name filter (case-insensitive)"),
    status: Optional[str] = Query(None, description="Optional listing status filter (open, negotiating, sold, withdrawn)"),
    db: Session = Depends(get_db)
):
    """
    List crop listings, filterable by crop type and status.
    Defaults to open/negotiating listings if status is not specified.
    """
    return negotiation_service.get_listings(db, crop=crop, status_filter=status)


@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(
    listing_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve details for a single listing, including its complete negotiation
    thread (all offers and counter-offers) in chronological order.
    """
    listing = negotiation_service.get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found."
        )

    offers_data = [OfferResponse.model_validate(o) for o in listing.offers]
    return ListingDetailResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        crop=listing.crop,
        quantity=listing.quantity,
        unit=listing.unit,
        asking_price=listing.asking_price,
        status=listing.status,
        created_at=listing.created_at,
        offers=offers_data,
        round_count=len(offers_data)
    )


@router.post("/{listing_id}/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def submit_offer(
    listing_id: int,
    payload: OfferCreate,
    db: Session = Depends(get_db)
):
    """
    Submit an initial offer or a counter-offer against a listing.
    - Initial offer transitions listing status to 'negotiating'.
    - Counter-offer links to parent_offer_id and marks parent offer as 'countered'.
    - Rejects offers on sold or withdrawn listings (409 Conflict).
    """
    return negotiation_service.create_offer(db, listing_id, payload)


@router.patch("/{listing_id}/offers/{offer_id}", response_model=OfferResponse)
def act_on_offer(
    listing_id: int,
    offer_id: int,
    payload: OfferActionRequest,
    db: Session = Depends(get_db)
):
    """
    Accept or reject a pending offer.
    - On accept: sets offer status to 'accepted' and listing status to 'sold'.
    - On reject: sets offer status to 'rejected' and listing status to 'open'.
    - Rejects action on stale or non-pending offers (422 Unprocessable Entity).
    """
    return negotiation_service.handle_offer_action(
        db=db,
        listing_id=listing_id,
        offer_id=offer_id,
        action=payload.action
    )
