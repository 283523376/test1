"""App 1 BFF endpoints: estimate history CRUD and property comparison."""

from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import EstimateRecord, get_db
from ..model import ModelNotLoadedError, model_manager
from ..schemas import (
    CompareRequest,
    CompareResponse,
    CompareRow,
    Estimate,
    EstimateCreate,
    EstimateList,
)

router = APIRouter(tags=["estimates"])


def _to_estimate(record: EstimateRecord) -> Estimate:
    created = record.created_at
    if isinstance(created, str):
        try:
            created = datetime.fromisoformat(created)
        except ValueError:
            created = None
    return Estimate(
        id=record.id,
        label=record.label,
        features=record.features,
        price=record.price,
        created_at=created,
    )


@router.post("", response_model=Estimate, status_code=201)
def create_estimate(payload: EstimateCreate, db: Session = Depends(get_db)) -> Estimate:
    """Predict the price for the given features and persist the estimate."""
    try:
        price = model_manager.predict(payload.features.to_array())
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    record = EstimateRecord(
        label=payload.label,
        features_json=json.dumps(payload.features.model_dump()),
        price=round(price, 2),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_estimate(record)


@router.get("", response_model=EstimateList)
def list_estimates(db: Session = Depends(get_db)) -> EstimateList:
    """Return saved estimates, most recent first."""
    records = db.scalars(select(EstimateRecord).order_by(EstimateRecord.id.desc())).all()
    return EstimateList(items=[_to_estimate(r) for r in records], count=len(records))


@router.delete("/{estimate_id}", status_code=204, response_class=Response)
def delete_estimate(estimate_id: int, db: Session = Depends(get_db)):
    """Delete a saved estimate by id."""
    record = db.get(EstimateRecord, estimate_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Estimate not found")
    db.delete(record)
    db.commit()


@router.post("/compare", response_model=CompareResponse)
def compare(payload: CompareRequest) -> CompareResponse:
    """Predict prices for multiple properties side-by-side."""
    try:
        prices = model_manager.predict_batch([i.features.to_array() for i in payload.items])
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return CompareResponse(
        rows=[
            CompareRow(label=item.label, features=item.features, price=round(p, 2))
            for item, p in zip(payload.items, prices)
        ]
    )
