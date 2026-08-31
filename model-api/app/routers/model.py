"""Task 1 ML endpoints: health, model-info, predict (single + batch)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..model import ModelNotLoadedError, model_manager
from ..schemas import (
    BatchRequest,
    BatchResponse,
    HousingFeatures,
    ModelInfo,
    Prediction,
)

router = APIRouter(tags=["model"])


@router.get("/health")
def health() -> dict:
    """Simple liveness/readiness check."""
    return {"status": "ok", "model_loaded": model_manager.loaded}


@router.get("/model-info", response_model=ModelInfo)
def model_info() -> ModelInfo:
    """Return model coefficients and performance metrics."""
    try:
        return ModelInfo(**model_manager.model_info())
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/predict", response_model=Prediction)
def predict(features: HousingFeatures) -> Prediction:
    """Predict the price of a single property."""
    try:
        price = model_manager.predict(features.to_array())
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return Prediction(price=round(price, 2), features=features)


@router.post("/predict/batch", response_model=BatchResponse)
def predict_batch(batch: BatchRequest) -> BatchResponse:
    """Predict prices for a batch of properties."""
    try:
        prices = model_manager.predict_batch([i.to_array() for i in batch.items])
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return BatchResponse(
        predictions=[
            Prediction(price=round(p, 2), features=f)
            for p, f in zip(prices, batch.items)
        ]
    )
