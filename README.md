# Housing Portal — Price Prediction + Multi-Application Portal

A full-stack demo that pairs a containerized ML model with a unified Next.js portal
hosting two independent applications, each with a different backend technology.

| Service | Directory | Stack | Port |
|---|---|---|---|
| ML Model API (Task 1 + App 1 backend) | `model-api/` | Python 3.12, FastAPI, scikit-learn | `8000` |
| Market Analysis API (App 2 backend) | `market-api/` | Java 21, Spring Boot 3.4.4 | `8080` |
| Next.js Portal | `portal/` | Next.js (App Router), TypeScript, Tailwind, Recharts | `3000` |

```
                 ┌────────────────────────────────────────────┐
                 │          Next.js Portal (3000)              │
                 │  App 1: Property Value Estimator            │
                 │  App 2: Property Market Analysis            │
                 └──────────────┬────────────────┬─────────────┘
                                │                │
                    (HTTP/REST) │                │ (HTTP/REST)
                                ▼                ▼
                 ┌─────────────────────┐   ┌─────────────────────┐
                 │  model-api (8000)   │   │  market-api (8080)  │
                 │  FastAPI + sklearn  │◄──│  Spring Boot        │
                 │  + SQLite history   │   │  + Caffeine cache   │
                 └─────────────────────┘   └─────────────────────┘
```

## Requirements

- **Task 1** — a regression model that predicts housing prices, containerized and
  exposed over FastAPI with Swagger/OpenAPI docs.
- **Task 2** — a unified portal with a shared layout and two apps:
  - **App 1 (Python backend)** — property value estimator: form, validation,
    tabular + chart results, history, side-by-side comparison.
  - **App 2 (Java backend)** — market analysis: dashboard, filters, what-if
    tooling, CSV/PDF export, sortable/filterable tables.

## Dataset

`House Price Dataset.csv` — 50 rows, 7 features → `price`:

`square_footage, bedrooms, bathrooms, year_built, lot_size,
distance_to_city_center, school_rating`

`Test Data For Prediction.csv` — 10 unlabeled rows (for batch-prediction demos).

---

## Quick start (Docker Compose)

```bash
docker compose up --build
```

Then open:

- Portal → http://localhost:3000
- ML model Swagger UI → http://localhost:8000/docs
- Market API → http://localhost:8080/api/market/summary

The estimate history is persisted in a named volume (`model-data`).

## Run the services individually

### 1. Model API

```bash
cd model-api
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m training.train          # train & save the model (optional; done on first boot)
uvicorn app.main:app --reload
```

### 2. Market API

```bash
cd market-api
mvn spring-boot:run               # requires JDK 21 + Maven
```

Set `MODEL_API_URL` if the model API is not at `http://localhost:8000`.

### 3. Portal

```bash
cd portal
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and adjust the URLs if needed.

---

## API reference

### model-api (FastAPI)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check (+ model-loaded flag) |
| GET | `/model-info` | Coefficients, intercept, R² / MAE / RMSE, dataset stats |
| POST | `/predict` | Single prediction → `{ price, features }` |
| POST | `/predict/batch` | Batch prediction |
| POST | `/estimates` | Predict + persist an estimate |
| GET | `/estimates` | List saved estimates (newest first) |
| DELETE | `/estimates/{id}` | Delete an estimate |
| POST | `/estimates/compare` | Compare multiple properties side-by-side |

Example:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":2001,"lot_size":7200,"distance_to_city_center":4.5,"school_rating":7.8}'
```

### market-api (Spring Boot)

| Method | Path | Description |
|---|---|---|
| GET | `/api/market/summary` | Aggregate stats (count, avg/min/max price, price/sq ft) |
| GET | `/api/market/segments` | Avg price by bedrooms / year range / distance band |
| GET | `/api/market/properties` | Filterable, sortable, paginated property list |
| GET | `/api/market/what-if` | What-if prediction via the model API |
| GET | `/api/market/export` | CSV download of the filtered dataset |

Filter params (summary/properties/export): `bedrooms`, `yearMin`, `yearMax`, `distanceMax`.
Sort params (properties): `sortBy` (`price`, `square_footage`, …), `sortDir` (`asc`/`desc`).

---

## Interview demo script

1. **Task 1 (model)** — open http://localhost:8000/docs, run `/model-info` to show the
   coefficients and metrics, then `/predict` and `/predict/batch`.
2. **App 1** — submit a property, see the prediction (table + chart), save it, then
   select two estimates and hit *Compare*.
3. **App 2** — browse the dashboard, apply filters, try the *What-if* tool, and export
   CSV + PDF.
4. **Resilience** — stop a backend and show the portal's graceful error states.

## Notes

- The model is a standardized **Ridge (L2-regularized) linear regression** (so
  `/model-info` can report stable coefficients); metrics are computed on a held-out
  20% split. Regularization counters the multicollinearity in the synthetic features.
- The model is trained at image build time and also trains on first boot if no
  artifacts exist, so `uvicorn` alone works.
- CORS is permissive (`*`) for the demo — restrict it in production.
