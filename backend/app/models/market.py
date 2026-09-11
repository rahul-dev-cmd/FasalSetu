"""
SQLAlchemy Models for Markets and Market Prices
==============================================
Stores mandi/market metadata and historical commodity prices across Indian agricultural markets.
"""

from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationship to associated commodity price records
    prices = relationship("MarketPrice", back_populates="market", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Market(id={self.id}, name='{self.name}', state='{self.state}', district='{self.district}')>"


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False, index=True)
    recorded_date = Column(Date, nullable=False, index=True)

    # Relationship back to the market
    market = relationship("Market", back_populates="prices")

    def __repr__(self):
        return (
            f"<MarketPrice(id={self.id}, market_id={self.market_id}, crop='{self.crop}', "
            f"modal={self.modal_price}, date={self.recorded_date})>"
        )
