"""Train the housing-price regression model and serialize artifacts.

Run directly:
    python -m training.train

or import `train_model` to (re)train programmatically.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Canonical feature order — the API contract for prediction inputs.
FEATURES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET = "price"

# Paths are resolved relative to this file so the script works regardless of CWD.
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATA_PATH = BASE_DIR / "data" / "House Price Dataset.csv"
DEFAULT_OUTPUT_DIR = BASE_DIR / "models"


def load_dataset(path: str | os.PathLike = DEFAULT_DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def train_model(
    data_path: str | os.PathLike = DEFAULT_DATA_PATH,
    output_dir: str | os.PathLike = DEFAULT_OUTPUT_DIR,
    test_size: float = 0.2,
    random_state: int = 42,
) -> dict:
    """Fit a standardized ridge regression, evaluate it, and persist artifacts.

    Ridge (L2 regularization) is used instead of plain least squares because the
    synthetic features are highly collinear (square footage, bedrooms, and lot
    size move together). Regularization yields stable, intuitively-signed
    coefficients while retaining ~0.98 R².
    """
    df = load_dataset(data_path)
    X = df[FEATURES].to_numpy(dtype=float)
    y = df[TARGET].to_numpy(dtype=float)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = Ridge(alpha=10.0)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    metrics = {
        "r2": round(float(r2_score(y_test, y_pred)), 4),
        "mae": round(float(mean_absolute_error(y_test, y_pred)), 2),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2),
        "test_size": len(X_test),
        "train_size": len(X_train),
    }

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, output_dir / "model.pkl")
    joblib.dump(scaler, output_dir / "scaler.pkl")

    info = {
        "features": FEATURES,
        "target": TARGET,
        "coefficients": {f: round(float(c), 6) for f, c in zip(FEATURES, model.coef_)},
        "intercept": round(float(model.intercept_), 6),
        "metrics": metrics,
        "dataset_stats": {
            "count": int(len(y)),
            "mean_price": round(float(y.mean()), 2),
            "min_price": round(float(y.min()), 2),
            "max_price": round(float(y.max()), 2),
        },
    }
    with open(output_dir / "metrics.json", "w", encoding="utf-8") as fh:
        json.dump(info, fh, indent=2)

    return info


if __name__ == "__main__":
    result = train_model()
    print(json.dumps(result, indent=2))
