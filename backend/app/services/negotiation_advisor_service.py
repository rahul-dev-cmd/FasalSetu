"""
AI Negotiation Advisor Service
==============================
Provides advisory-only negotiation guidance for farmers and buyers during price negotiations,
grounded in real recorded mandi price benchmarks (when available) and the listing's offer thread.
Strictly decoupled from FarmerQAService.
"""

import logging
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from groq import Groq, APIError, APITimeoutError, APIConnectionError

from app.core.config import settings
from app.models.crop_listing import CropListing, CropOffer
from app.models.market import MarketPrice, Market

logger = logging.getLogger("fasalsetu_negotiation_advisor")


class GroqNegotiationUnavailableException(Exception):
    """Raised when Groq API is unreachable, times out, or fails during negotiation advisory."""
    pass


SYSTEM_PROMPT = """You are FasalSetu's AI Negotiation Advisor, an expert agricultural trade assistant for Indian agricultural markets.
You provide strategic, realistic, and fair negotiation advice to farmers and buyers engaged in price negotiations for crop listings.

CRITICAL DIRECTIVES:
1. ADVISORY ONLY — ZERO AUTONOMOUS ACTIONS:
   - You are purely an advisor. You MUST NEVER submit, counter, accept, or reject an offer on behalf of the user.
   - You MUST NEVER state or imply that you have taken any action (e.g. NEVER say "I have submitted a counter-offer", "I countered with ₹X", or "I have accepted this offer for you").
   - Always frame suggestions as choices for the user to make themselves: e.g., "You could consider countering at ₹X", "You might consider accepting this offer", "A reasonable next offer to submit would be ₹X".

2. NATIONAL BENCHMARK MARKET DATA SCOPE:
   - When mandi market prices are provided in the context, clearly treat them as NATIONAL / GENERAL benchmark market data across recorded mandis.
   - DO NOT claim, promise, or imply that these prices are specific to the farmer's local mandi or district, as local mandi rates may vary.
   - If no recorded market price data is available, explicitly let the user know and advise them based on general agricultural pricing principles while recommending they check their local mandi.

3. ROLE-ALIGNED COACHING:
   - If advising a FARMER: Help them evaluate buyer offers against market benchmarks, protect their profit margin, consider transport/holding costs, and craft polite, firm counter-offers.
   - If advising a BUYER: Help them make fair, competitive offers that respect quality and quantity while staying within reasonable market value.

4. SCOPE & INTEGRITY:
   - Confine your advice to the provided crop, listing details, and negotiation thread.
   - Do not invent hypothetical offers or make false promises about the counterparty's bottom line.
   - If asked non-agricultural or non-negotiation questions, politely steer back to this listing's negotiation.

5. LANGUAGE:
   - Always reply in the same language as the user's message (e.g., Hindi, English, Hinglish, regional languages). Keep advice concise, respectful, and actionable.
"""


class NegotiationAdvisorService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self._client: Optional[Groq] = None

    def get_client(self) -> Groq:
        if self._client is None:
            if not self.api_key or self.api_key == "gsk_your_groq_api_key_here":
                raise GroqNegotiationUnavailableException("Groq API key is not configured in environment")
            self._client = Groq(api_key=self.api_key, timeout=15.0)
        return self._client

    def fetch_market_price_context(self, db: Session, crop_name: str) -> Tuple[Optional[str], bool]:
        """
        Retrieves recorded mandi prices for the crop across all recorded mandis nationally.
        Returns a formatted context string and a boolean indicating whether data was found.
        """
        clean_crop = crop_name.strip().lower()
        records = (
            db.query(MarketPrice, Market)
            .join(Market, MarketPrice.market_id == Market.id)
            .filter(MarketPrice.crop.ilike(clean_crop))
            .all()
        )

        if not records:
            return None, False

        min_prices = [p.min_price for p, _ in records]
        max_prices = [p.max_price for p, _ in records]
        modal_prices = [p.modal_price for p, _ in records]
        mandi_names = list({f"{m.name} ({m.state})" for _, m in records})

        overall_min = min(min_prices)
        overall_max = max(max_prices)
        avg_modal = round(sum(modal_prices) / len(modal_prices), 2)

        context_str = (
            f"National benchmark market data for {crop_name.title()} across {len(records)} recorded mandi records:\n"
            f"- Price range across mandis: ₹{overall_min:.2f} to ₹{overall_max:.2f} per quintal / unit\n"
            f"- Average modal price across recorded mandis: ₹{avg_modal:.2f}\n"
            f"- Recorded mandis include: {', '.join(mandi_names[:5])}\n"
            f"(Note: These are national benchmark prices across recorded mandis, not guaranteed local mandi rates.)"
        )
        return context_str, True

    def build_negotiation_context(
        self,
        listing: CropListing,
        user_role: str,
        user_id: int,
        market_context_str: Optional[str]
    ) -> str:
        """
        Assembles all negotiation thread facts into structured context for the advisor.
        """
        lines = [
            f"=== CURRENT NEGOTIATION THREAD ===",
            f"Listing ID: {listing.id}",
            f"Crop: {listing.crop}",
            f"Quantity: {listing.quantity} {listing.unit}",
            f"Asking Price (by farmer): ₹{listing.asking_price:.2f} per {listing.unit}",
            f"Listing Status: {listing.status}",
            f"User requesting advice: Role = '{user_role}' (User ID: {user_id})",
            "",
            "=== OFFER HISTORY (Chronological) ==="
        ]

        if not listing.offers:
            lines.append("No offers submitted yet. The listing is open for initial offers.")
        else:
            for idx, offer in enumerate(listing.offers, start=1):
                parent_info = f" (in response to Offer #{offer.parent_offer_id})" if offer.parent_offer_id else ""
                lines.append(
                    f"Round {idx} | Offer #{offer.id}: ₹{offer.amount:.2f} | "
                    f"Made by: {offer.made_by.upper()} | Status: {offer.status}{parent_info}"
                )

        lines.append("")
        lines.append("=== MARKET BENCHMARK DATA ===")
        if market_context_str:
            lines.append(market_context_str)
        else:
            lines.append(
                f"No national mandi price records currently available in database for '{listing.crop}'. "
                f"Remind the user to verify against current local mandi spot rates."
            )

        return "\n".join(lines)

    def advise(
        self,
        db: Session,
        listing: CropListing,
        user_role: str,
        user_id: int,
        user_message: str
    ) -> Tuple[str, bool]:
        """
        Generates advisory guidance for the farmer or buyer on the active listing.
        Returns a tuple: (advisory_reply, market_context_used).
        Raises GroqNegotiationUnavailableException on network/API failure.
        """
        market_context_str, market_context_used = self.fetch_market_price_context(db, listing.crop)
        negotiation_context = self.build_negotiation_context(
            listing=listing,
            user_role=user_role,
            user_id=user_id,
            market_context_str=market_context_str
        )

        user_prompt = (
            f"{negotiation_context}\n\n"
            f"=== USER QUESTION / QUERY ===\n"
            f"{user_message.strip()}"
        )

        try:
            client = self.get_client()
            logger.info(
                "Calling Groq negotiation advisor for listing %s, user %s (%s)",
                listing.id, user_id, user_role
            )
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=800,
                timeout=15.0
            )

            reply = response.choices[0].message.content.strip()
            return reply, market_context_used

        except (APIError, APITimeoutError, APIConnectionError, Exception) as exc:
            logger.error("Groq negotiation advisor API failed: %s", exc, exc_info=True)
            raise GroqNegotiationUnavailableException("Negotiation assistant unavailable, please try again shortly") from exc


# Global service singleton
negotiation_advisor_service = NegotiationAdvisorService()
