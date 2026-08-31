"""Pydantic request/response models with validation bounds."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from training.train import FEATURES


class HousingFeatures(BaseModel):
    """The seven features required to predict a housing price."""

    square_footage: float = Field(..., gt=0, description="Interior area in sq ft")
    bedrooms: int = Field(..., ge=1, le=10)
    bathrooms: float = Field(..., ge=0.5, le=10, description="May be fractional (half-baths)")
    year_built: int = Field(..., ge=1800, le=2026)
    lot_size: float = Field(..., gt=0, description="Lot area in sq ft")
    distance_to_city_center: float = Field(..., ge=0, description="Miles from city center")
    school_rating: float = Field(..., ge=1, le=10)

    def to_array(self) -> list[float]:
        """Feature values in the model's canonical order."""
        return [float(getattr(self, f)) for f in FEATURES]


class BatchRequest(BaseModel):
    items: list[HousingFeatures] = Field(..., min_length=1, max_length=1000)


class Prediction(BaseModel):
    price: float
    features: HousingFeatures


class BatchResponse(BaseModel):
    predictions: list[Prediction]


class ModelInfo(BaseModel):
    features: list[str]
    target: str
    coefficients: dict[str, float]
    intercept: float
    metrics: dict[str, Any]
    dataset_stats: dict[str, float] | None = None


# ---- App 1 BFF: estimate history ----


class EstimateCreate(BaseModel):
    """A submitted estimate: the inputs plus an optional label.

    The predicted price is computed server-side and stored with the estimate.
    """

    features: HousingFeatures
    label: str = Field("", max_length=120)


class Estimate(EstimateCreate):
    id: int
    price: float
    created_at: datetime

    model_config = {"from_attributes": True}


class EstimateList(BaseModel):
    items: list[Estimate]
    count: int


class CompareItem(BaseModel):
    features: HousingFeatures
    label: str = Field("", max_length=120)


class CompareRequest(BaseModel):
    """Compare N properties side-by-side (predicted + input features)."""

    items: list[CompareItem] = Field(..., min_length=1, max_length=20)


class CompareRow(BaseModel):
    label: str
    features: HousingFeatures
    price: float


class CompareResponse(BaseModel):
    rows: list[CompareRow]
