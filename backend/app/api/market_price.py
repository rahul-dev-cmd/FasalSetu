"""
Market Price Comparison API Route
=================================
Handles GET /api/market-prices to compare crop prices across mandis,
sorted by modal price descending with case-insensitive crop and state filtering.
"""

from typing import Optional
import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.constants import VALID_CROPS, VALID_CROPS_SET
from app.models.market import Market, MarketPrice
from app.schemas.market_price import MarketPriceItem, MarketPriceResponse
from app.schemas.crop_recommendation import ErrorResponse

logger = logging.getLogger("fasalsetu_api")
router = APIRouter()


@router.get(
    "/market-prices",
    response_model=MarketPriceResponse,
    responses={
        200: {"model": MarketPriceResponse, "description": "Market prices sorted by modal price descending"},
        422: {"description": "Validation error (missing or unrecognized crop label)"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Compare crop prices across agricultural markets (mandis)"
)
def get_market_prices(
    crop: str = Query(..., description="Crop name to compare prices for (must be one of 22 valid crops)"),
    state: Optional[str] = Query(None, description="Optional Indian state to filter markets (case-insensitive)"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of markets to return"),
    db: Session = Depends(get_db)
):
    """
    Returns commodity prices across mandis for a specified crop,
    sorted by modal_price descending. Identifies the best paying market.
    """
    try:
        # Case-insensitive crop validation against the canonical 22 crop list
        normalized_crop = crop.strip().lower()
        if normalized_crop not in VALID_CROPS_SET:
            valid_list_str = ", ".join(sorted(VALID_CROPS))
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Crop '{crop}' is not recognized. Must be one of: {valid_list_str}"
            )

        # Base query joining MarketPrice and Market for the requested crop
        query = (
            db.query(MarketPrice, Market)
            .join(Market, MarketPrice.market_id == Market.id)
            .filter(MarketPrice.crop == normalized_crop)
        )

        # Case-insensitive state filter (e.g. 'maharashtra' matches 'Maharashtra')
        if state and state.strip():
            normalized_state = state.strip()
            query = query.filter(
                func.lower(Market.state) == normalized_state.lower()
            )

        # Get latest recorded date for each market to prevent duplicate historical entries in ranking
        # Subquery or ordering by recorded_date desc, modal_price desc
        records = (
            query.order_by(
                MarketPrice.modal_price.desc(),
                MarketPrice.recorded_date.desc()
            )
            .all()
        )

        # Deduplicate to keep the latest/best entry per market if multiple dates exist
        seen_markets = set()
        items = []
        for price, market in records:
            if market.id in seen_markets:
                continue
            seen_markets.add(market.id)

            items.append(
                MarketPriceItem(
                    market_name=market.name,
                    state=market.state,
                    district=market.district,
                    min_price=float(price.min_price),
                    max_price=float(price.max_price),
                    modal_price=float(price.modal_price),
                    recorded_date=price.recorded_date.isoformat(),
                    distance_km=None  # Geolocation distance is future scope; return null as requested
                )
            )
            if len(items) >= limit:
                break

        best_market = items[0].market_name if items else None

        return MarketPriceResponse(
            crop=normalized_crop,
            markets=items,
            best_price_market=best_market
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Internal error fetching market prices: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Failed to fetch market prices. Please try again."}
        )
