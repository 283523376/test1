"""Application configuration and path resolution."""

from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # model-api/
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = DATA_DIR / "House Price Dataset.csv"

# SQLite database for the estimate-history feature (App 1 BFF).
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "housing.db")))

MODEL_PKL = MODELS_DIR / "model.pkl"
SCALER_PKL = MODELS_DIR / "scaler.pkl"
METRICS_JSON = MODELS_DIR / "metrics.json"


class Settings:
    """Runtime settings, overridable via environment variables."""

    app_name: str = "Housing Price Prediction API"
    version: str = "1.0.0"

    # CORS origins for the Next.js portal. `*` is used for the demo (no auth/cookies);
    # restrict this list in production.
    cors_origins: list[str] = os.getenv(
        "CORS_ORIGINS", "*"
    ).split(",")


settings = Settings()
