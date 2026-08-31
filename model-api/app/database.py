"""SQLite persistence for the estimate-history feature."""

from __future__ import annotations

import json
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_PATH

engine = create_engine(
    f"sqlite:///{DATABASE_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class EstimateRecord(Base):
    """A saved property estimate, storing the raw feature JSON and predicted price."""

    __tablename__ = "estimates"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(120), default="")
    features_json = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    @property
    def features(self) -> dict:
        return json.loads(self.features_json)

    def to_dict(self) -> dict:
        created = self.created_at
        if isinstance(created, datetime):
            created = created.isoformat()
        return {
            "id": self.id,
            "label": self.label,
            "features": self.features,
            "price": self.price,
            "created_at": created,
        }


def get_db():
    """FastAPI dependency that yields a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
