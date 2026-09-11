"""
Negotiation Service for Feature 7: Price Negotiation
====================================================
Manages the negotiation state machine across listings, offers,
counters, and final settlement actions (accept/reject).
"""

import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.crop_listing import CropListing, CropOffer
from app.schemas.listing import ListingCreate, OfferCreate

logger = logging.getLogger("fasalsetu.negotiation")


class NegotiationService:
    @staticmethod
    def create_listing(db: Session, data: ListingCreate) -> CropListing:
        listing = CropListing(
            farmer_id=data.farmer_id.strip(),
            crop=data.crop.strip().lower(),
            quantity=data.quantity,
            unit=data.unit.strip(),
            asking_price=data.asking_price,
            status="open",
        )
        db.add(listing)
        db.commit()
        db.refresh(listing)
        return listing

    @staticmethod
    def get_listings(
        db: Session,
        crop: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[CropListing]:
        query = db.query(CropListing)
        if status_filter:
            query = query.filter(CropListing.status == status_filter.strip().lower())
        else:
            # Default to open listings for buyers, but also allow negotiating if desired
            query = query.filter(CropListing.status.in_(["open", "negotiating"]))

        if crop:
            query = query.filter(CropListing.crop.ilike(f"%{crop.strip().lower()}%"))

        return query.order_by(desc(CropListing.created_at)).all()

    @staticmethod
    def get_listing_by_id(db: Session, listing_id: int) -> Optional[CropListing]:
        return db.query(CropListing).filter(CropListing.id == listing_id).first()

    @staticmethod
    def create_offer(db: Session, listing_id: int, data: OfferCreate) -> CropOffer:
        listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with id {listing_id} not found."
            )

        if listing.status in ["sold", "withdrawn"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot make an offer on a {listing.status} listing."
            )

        if data.parent_offer_id is not None:
            parent_offer = db.query(CropOffer).filter(
                CropOffer.id == data.parent_offer_id,
                CropOffer.listing_id == listing_id
            ).first()

            if not parent_offer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Parent offer with id {data.parent_offer_id} not found on this listing."
                )

            if parent_offer.status != "pending":
                raise HTTPException(
                    status_code=422,
                    detail=f"Cannot counter an offer that is already {parent_offer.status}."
                )

            # Mark parent offer as superseded by this counter-offer
            parent_offer.status = "countered"

        # If listing was open, it is now negotiating
        if listing.status == "open":
            listing.status = "negotiating"

        # Check existing thread length and log warning if >= 10 rounds
        thread_count = db.query(CropOffer).filter(CropOffer.listing_id == listing_id).count()
        if thread_count >= 10:
            logger.warning(
                "Negotiation thread for listing %s has exceeded 10 rounds (current count: %s).",
                listing_id,
                thread_count + 1
            )

        new_offer = CropOffer(
            listing_id=listing_id,
            buyer_id=data.buyer_id.strip(),
            amount=data.amount,
            made_by=data.made_by,
            status="pending",
            parent_offer_id=data.parent_offer_id,
        )
        db.add(new_offer)
        db.commit()
        db.refresh(new_offer)
        return new_offer

    @staticmethod
    def handle_offer_action(
        db: Session,
        listing_id: int,
        offer_id: int,
        action: str
    ) -> CropOffer:
        listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with id {listing_id} not found."
            )

        offer = db.query(CropOffer).filter(
            CropOffer.id == offer_id,
            CropOffer.listing_id == listing_id
        ).first()

        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Offer with id {offer_id} not found on listing {listing_id}."
            )

        if offer.status != "pending":
            raise HTTPException(
                status_code=422,
                detail="Cannot act on a non-pending or stale offer."
            )

        clean_action = action.strip().lower()
        if clean_action == "accept":
            offer.status = "accepted"
            listing.status = "sold"
        elif clean_action == "reject":
            offer.status = "rejected"
            listing.status = "open"
        else:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid action '{action}'. Action must be 'accept' or 'reject'."
            )

        db.commit()
        db.refresh(offer)
        return offer


negotiation_service = NegotiationService()
