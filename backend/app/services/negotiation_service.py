"""
Negotiation Service for Feature 7: Price Negotiation
====================================================
Manages the negotiation state machine across listings, offers,
counters, and final settlement actions (accept/reject).
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.crop_listing import CropListing, CropOffer
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.listing import ListingCreate, OfferCreate

logger = logging.getLogger("fasalsetu.negotiation")


class NegotiationService:
    @staticmethod
    def create_listing(db: Session, data: ListingCreate, farmer_id: int) -> CropListing:
        listing = CropListing(
            farmer_id=farmer_id,
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
        status_filter: Optional[str] = "open"
    ) -> List[CropListing]:
        query = db.query(CropListing)
        if status_filter:
            clean_status = status_filter.strip().lower()
            if clean_status != "all":
                query = query.filter(CropListing.status == clean_status)

        if crop:
            query = query.filter(CropListing.crop.ilike(f"%{crop.strip().lower()}%"))

        return query.order_by(desc(CropListing.created_at)).all()

    @staticmethod
    def get_listing_by_id(db: Session, listing_id: int) -> Optional[CropListing]:
        return db.query(CropListing).filter(CropListing.id == listing_id).first()

    @staticmethod
    def create_offer(db: Session, listing_id: int, data: OfferCreate, current_user: User) -> CropOffer:
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

        # Role & Party Authorization
        if data.made_by == "buyer":
            if current_user.role != "buyer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: Only buyers can submit buyer offers."
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

                if int(parent_offer.buyer_id) != int(current_user.id):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Forbidden: You are not authorized to counter on another buyer's negotiation thread."
                    )

                parent_offer.status = "countered"
                buyer_id = int(current_user.id)
            else:
                buyer_id = int(current_user.id)

        elif data.made_by == "farmer":
            if current_user.role != "farmer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: Only farmers can submit farmer counter-offers."
                )

            if int(listing.farmer_id) != int(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: You do not own this listing."
                )

            if data.parent_offer_id is None:
                raise HTTPException(
                    status_code=422,
                    detail="Farmers cannot initiate offers; they can only counter an existing pending offer."
                )

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

            parent_offer.status = "countered"
            buyer_id = int(parent_offer.buyer_id)

        else:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid made_by value: {data.made_by}. Must be 'farmer' or 'buyer'."
            )

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
            buyer_id=buyer_id,
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
        action: str,
        current_user: User
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

        # Party Authorization:
        # If offer was made by buyer -> only the listing's owning farmer can accept/reject
        # If offer was made by farmer -> only that offer's buyer can accept/reject
        if offer.made_by == "buyer":
            if int(listing.farmer_id) != int(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: Only the listing's owning farmer can accept or reject this offer."
                )
        elif offer.made_by == "farmer":
            if int(offer.buyer_id) != int(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: Only the buyer involved in this offer can accept or reject this counter-offer."
                )
        else:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown made_by value '{offer.made_by}' on offer."
            )

        clean_action = action.strip().lower()
        if clean_action == "accept":
            offer.status = "accepted"
            listing.status = "sold"

            # Feature 17: Auto-create deal transaction status tracker
            existing_tx = db.query(Transaction).filter(Transaction.listing_id == listing.id).first()
            if not existing_tx:
                now = datetime.now(timezone.utc)
                tx = Transaction(
                    listing_id=listing.id,
                    offer_id=offer.id,
                    farmer_id=listing.farmer_id,
                    buyer_id=offer.buyer_id,
                    agreed_price=offer.amount,
                    pickup_target_date=now + timedelta(days=2),
                    payment_target_date=now + timedelta(days=6),
                    logistics_status="active",
                    payment_status="pending",
                    overall_status="in_progress",
                    created_at=now,
                    updated_at=now,
                )
                db.add(tx)
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

    @staticmethod
    def get_buyer_offers(db: Session, buyer_id: int) -> List[CropOffer]:
        return (
            db.query(CropOffer)
            .filter(CropOffer.buyer_id == buyer_id)
            .order_by(desc(CropOffer.created_at))
            .all()
        )

    @staticmethod
    def get_farmer_listings(db: Session, farmer_id: int) -> List[CropListing]:
        return (
            db.query(CropListing)
            .filter(CropListing.farmer_id == farmer_id)
            .order_by(desc(CropListing.created_at))
            .all()
        )


negotiation_service = NegotiationService()
