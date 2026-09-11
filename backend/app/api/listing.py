"""
FastAPI Router for Feature 7 & 10: Price Negotiation & Marketplace Browse
========================================================================
Endpoints for listing crops, submitting offers and counter-offers,
accepting/rejecting negotiation offers, and personal marketplace dashboards.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
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
my_router = APIRouter(prefix="/my", tags=["User Marketplace Views"])


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer"))
):
    """
    Farmer creates a new crop listing with asking price, quantity, and unit.
    Requires a valid farmer JWT bearer token. Initial status defaults to 'open'.
    farmer_id is set automatically from the authenticated user token.
    """
    return negotiation_service.create_listing(db, payload, farmer_id=current_user.id)


@router.get("", response_model=List[ListingResponse])
def list_listings(
    crop: Optional[str] = Query(None, description="Optional crop name filter (case-insensitive)"),
    status: Optional[str] = Query("open", description="Optional listing status filter ('open', 'negotiating', 'sold', 'withdrawn', or 'all'). Defaults to 'open'."),
    db: Session = Depends(get_db)
):
    """
    Marketplace browse: list crop listings filterable by crop type and status.
    Defaults to 'open' listings to exclude sold/withdrawn listings unless explicitly requested.
    Pass status='all' to retrieve listings across all statuses.
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit an initial offer or a counter-offer against a listing.
    - made_by='buyer': requires valid buyer JWT.
    - made_by='farmer': requires valid farmer JWT and ownership of the listing.
    - Initial offer transitions listing status to 'negotiating'.
    - Counter-offer links to parent_offer_id and marks parent offer as 'countered'.
    - Rejects offers on sold or withdrawn listings (409 Conflict).
    """
    return negotiation_service.create_offer(db, listing_id, payload, current_user=current_user)


@router.patch("/{listing_id}/offers/{offer_id}", response_model=OfferResponse)
def act_on_offer(
    listing_id: int,
    offer_id: int,
    payload: OfferActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accept or reject a pending offer.
    Requires token holder to be the legitimate counter-party:
    - Buyer offers: only the listing's owning farmer can accept/reject (403 for others).
    - Farmer counters: only the buyer involved on that thread can accept/reject (403 for others).
    - On accept: sets offer status to 'accepted' and listing status to 'sold'.
    - On reject: sets offer status to 'rejected' and listing status to 'open'.
    - Rejects action on stale or non-pending offers (422 Unprocessable Entity).
    """
    return negotiation_service.handle_offer_action(
        db=db,
        listing_id=listing_id,
        offer_id=offer_id,
        action=payload.action,
        current_user=current_user
    )


@my_router.get("/offers", response_model=List[OfferResponse])
def get_my_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("buyer"))
):
    """
    Returns all offers made by the authenticated buyer across all listings.
    Allows buyers to track their ongoing negotiations in one place.
    """
    return negotiation_service.get_buyer_offers(db, current_user.id)


@my_router.get("/listings", response_model=List[ListingDetailResponse])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer"))
):
    """
    Returns all crop listings owned by the authenticated farmer,
    including each listing's full offer thread and round count.
    """
    listings = negotiation_service.get_farmer_listings(db, current_user.id)
    results = []
    for l in listings:
        offers_data = [OfferResponse.model_validate(o) for o in l.offers]
        results.append(
            ListingDetailResponse(
                id=l.id,
                farmer_id=l.farmer_id,
                crop=l.crop,
                quantity=l.quantity,
                unit=l.unit,
                asking_price=l.asking_price,
                status=l.status,
                created_at=l.created_at,
                offers=offers_data,
                round_count=len(offers_data)
            )
        )
    return results
