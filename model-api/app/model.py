"""Model loading and prediction. Exposes a module-level singleton `model_manager`."""

from __future__ import annotations

import json
from typing import Any

import joblib
import numpy as np

from .config import METRICS_JSON, MODEL_PKL, SCALER_PKL, DATASET_PATH, MODELS_DIR
from training.train import FEATURES, train_model


class ModelNotLoadedError(RuntimeError):
    """Raised when a prediction is requested before the model is available."""


class ModelManager:
    def __init__(self) -> None:
        self.model = None
        self.scaler = None
        self.info: dict[str, Any] = {}
        self._loaded = False

    @property
    def loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        """Load serialized artifacts, or train from scratch if they are missing."""
        if not (MODEL_PKL.exists() and SCALER_PKL.exists() and METRICS_JSON.exists()):
            # Fallback so `uvicorn` alone works without a separate training step.
            train_model(DATASET_PATH, MODELS_DIR)

        self.model = joblib.load(MODEL_PKL)
        self.scaler = joblib.load(SCALER_PKL)
        with open(METRICS_JSON, "r", encoding="utf-8") as fh:
            self.info = json.load(fh)
        self._loaded = True

    def _require_model(self) -> None:
        if not self._loaded or self.model is None:
            raise ModelNotLoadedError("Model is not loaded.")

    def predict(self, features: dict[str, float] | list[float]) -> float:
        self._require_model()
        if isinstance(features, dict):
            features = [float(features[f]) for f in FEATURES]
        X = np.asarray([features], dtype=float)
        X_scaled = self.scaler.transform(X)
        return float(self.model.predict(X_scaled)[0])

    def predict_batch(
        self, rows: list[dict[str, float] | list[float]]
    ) -> list[float]:
        self._require_model()
        X = np.asarray(
            [
                [float(r[f]) for f in FEATURES] if isinstance(r, dict) else list(r)
                for r in rows
            ],
            dtype=float,
        )
        X_scaled = self.scaler.transform(X)
        return [float(v) for v in self.model.predict(X_scaled)]

    def model_info(self) -> dict[str, Any]:
        self._require_model()
        return self.info


model_manager = ModelManager()
