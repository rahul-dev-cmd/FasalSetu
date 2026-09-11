# FasalSetu Backend

> **AI-Powered Agricultural Decision Platform for Indian Farmers**  
> Hackathon MVP — Feature 1: Crop Recommendation | Feature 2: Market Price Comparison

---

## 🌾 Overview

**FasalSetu** provides intelligent, data-driven decision support for Indian farmers:
1. **Crop Recommendation Engine**: Analyzes soil nutrients (Nitrogen, Phosphorus, Potassium) and local climate metrics (Temperature, Humidity, Soil pH, Rainfall) before planting to recommend the top crop + alternatives with statistical confidence.
2. **Market Price Comparison Engine**: Enables farmers to compare live/recent commodity prices across nearby agricultural mandis (markets) for any of the 22 supported crops, filter by state (case-insensitively), and identify the market offering the best return.

---

## 🚀 Quick Start (Docker Compose)

The entire stack (FastAPI Backend + PostgreSQL Database) launches with a single command.

### 1. Launch Services
```bash
# From project root:
docker-compose up --build
```

- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **PostgreSQL**: `localhost:5432` (`fasalsetu_db`)

> **Startup Ordering Guarantee**: Docker Compose enforces `condition: service_healthy` on the PostgreSQL container (`fasalsetu-db`). The backend starts only after PostgreSQL is fully initialized and accepting connections.
>
> **Build-Time ML Model Training**: The Random Forest model is trained at **Docker build time** inside the Dockerfile (`RUN python -m app.ml.train_crop_model`), baking `crop_rf_model.joblib` into the container image. Container startup only loads the pre-baked artifact into memory.
>
> **Automatic Database Seeding**: On first startup, the application initializes all database tables (`init_db`) and automatically seeds 20 mandis and commodity prices across 5 states (`seed_market_prices`).

---

## 🗄️ Database Configuration & SQLite Boundary

- **Production & Hackathon Demo**: The application connects to **PostgreSQL** (`postgresql://postgres:postgres@db:5432/fasalsetu_db`).
- **SQLite Usage Boundary**: SQLite is **strictly isolated to the automated test suite** (`tests/conftest.py`) using in-memory sessions (`sqlite:///:memory:`). Tests NEVER touch or modify the PostgreSQL database.
- **Local Development without Docker**: If running locally on host Python, you can point to local PostgreSQL or set `DATABASE_URL=sqlite:///./fasalsetu_dev.db` in your local `.env`.

---

## 📡 API Contract for Frontend Teammate

All endpoints support CORS (`Access-Control-Allow-Origin: *`) for seamless frontend development integration.

### 1. Health Check
Confirm backend server availability.

- **Method**: `GET`
- **Path**: `/api/health`
- **Response (200 OK)**:
```json
{
  "status": "ok"
}
```

```bash
curl -X GET http://localhost:8000/api/health
```

---

### 2. Crop Recommendation (Feature 1)
Predicts the optimal crop and top 2 alternatives based on 7 soil and climate parameters.

- **Method**: `POST`
- **Path**: `/api/crop-recommendation`
- **Headers**: `Content-Type: application/json`

#### Request Body Specification:
| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `nitrogen` | float | Yes | — | Soil Nitrogen content (N ratio) |
| `phosphorus` | float | Yes | — | Soil Phosphorus content (P ratio) |
| `potassium` | float | Yes | — | Soil Potassium content (K ratio) |
| `temperature` | float | Yes | — | Ambient temperature in °C |
| `humidity` | float | Yes | `0.0` to `100.0` | Relative humidity percentage |
| `ph` | float | Yes | `0.0` to `14.0` | Soil pH level |
| `rainfall` | float | Yes | — | Rainfall in mm |

#### Example Request Payload:
```json
{
  "nitrogen": 90.0,
  "phosphorus": 42.0,
  "potassium": 43.0,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.93
}
```

#### Success Response (200 OK):
```json
{
  "recommended_crop": "rice",
  "confidence": 0.90,
  "alternatives": [
    {
      "crop": "jute",
      "confidence": 0.10
    },
    {
      "crop": "pomegranate",
      "confidence": 0.00
    }
  ]
}
```

#### Validation Error (422 Unprocessable Content):
```json
{
  "detail": "Input validation failed",
  "errors": [
    {
      "field": "ph",
      "message": "ph must be between 0 and 14"
    }
  ]
}
```

#### Sample `curl`:
```bash
curl -X POST http://localhost:8000/api/crop-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "nitrogen": 90.0,
    "phosphorus": 42.0,
    "potassium": 43.0,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.93
  }'
```

---

### 3. Market Price Comparison (Feature 2)
Compares commodity prices across mandis for a given crop, sorted by modal price descending.

- **Method**: `GET`
- **Path**: `/api/market-prices`

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `crop` | string | **Yes** | — | Crop name (one of 22 valid crops, case-insensitive) |
| `state` | string | No | `null` | Indian state to filter markets (**case-insensitive**) |
| `limit` | integer | No | `10` | Max number of markets to return (`1` to `100`) |

#### Success Response (200 OK):
```json
{
  "crop": "rice",
  "markets": [
    {
      "market_name": "Jalandhar APMC",
      "state": "Punjab",
      "district": "Jalandhar",
      "min_price": 3600.60,
      "max_price": 3997.68,
      "modal_price": 3806.33,
      "recorded_date": "2026-09-10",
      "distance_km": null
    },
    {
      "market_name": "Neemuch Mandi",
      "state": "Madhya Pradesh",
      "district": "Neemuch",
      "min_price": 3383.20,
      "max_price": 4139.11,
      "modal_price": 3737.15,
      "recorded_date": "2026-09-11",
      "distance_km": null
    }
  ],
  "best_price_market": "Jalandhar APMC"
}
```

> **Note on `distance_km`**: Set to `null` because farmer coordinates are future scope. The schema is pre-stabilized for future geolocation integration.
>
> **Empty Results Handling**: If a filter (e.g. `state=NonExistentState`) matches zero markets, the API returns `200 OK` with `"markets": []` and `"best_price_market": null`.

#### Validation Error (422 Unprocessable Content):
Returned if `crop` is missing or not one of the 22 recognized crops:
```json
{
  "detail": "Crop 'avocado' is not recognized. Must be one of: apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon"
}
```

#### Sample `curl` Commands for Market Prices:

##### 1. Basic Query by Crop:
```bash
curl -X GET "http://localhost:8000/api/market-prices?crop=rice&limit=5"
```

##### 2. Filter by State (Case-Insensitive):
```bash
curl -X GET "http://localhost:8000/api/market-prices?crop=cotton&state=maharashtra"
```

##### 3. Testing Validation Handling (Unrecognized Crop):
```bash
curl -X GET "http://localhost:8000/api/market-prices?crop=avocado"
```

---

## 🌾 Supported Crops (Shared Canonical 22 Crops)

Both Feature 1 and Feature 2 import from the single source of truth: `app/core/constants.py`:
- **Cereals & Grains**: `rice`, `maize`
- **Pulses & Legumes**: `chickpea`, `kidneybeans`, `pigeonpeas`, `mothbeans`, `mungbean`, `blackgram`, `lentil`
- **Fruits**: `pomegranate`, `banana`, `mango`, `grapes`, `watermelon`, `muskmelon`, `apple`, `orange`, `papaya`, `coconut`
- **Cash Crops**: `cotton`, `jute`, `coffee`

---

## 🤖 Machine Learning Model Details

- **Algorithm**: Multi-Class `RandomForestClassifier` (`n_estimators=100`, `random_state=42`)
- **Dataset**: Atharva Ingle Crop Recommendation Dataset (Kaggle), 2,200 rows
- **Evaluated Test Accuracy**: **99.55%** on stratified 80/20 train/test split
- **Input Features (7)**: `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`
- **Output**: Top recommended crop + confidence + 2 alternative crops with confidences

---

## 🧪 Running Automated Tests

The test suite runs with complete test isolation using in-memory SQLite (no Postgres or Docker dependencies required for testing):

```bash
python -m pytest backend/tests -v
```

### Verified Test Suite (14 Tests):

#### Feature 1: Crop Recommendation (7 Tests)
1. `test_health_check` — Verifies `GET /api/health` returns `200` with `{"status": "ok"}`
2. `test_valid_crop_recommendation` — Verifies `POST /api/crop-recommendation` returns `200` with exact response structure
3. `test_invalid_input_ph_returns_422` — Verifies `ph = 20.0` returns `422` naming `ph` and constraints
4. `test_invalid_input_humidity_returns_422` — Verifies `humidity = 150.0` returns `422` naming `humidity`
5. `test_missing_required_field_returns_422` — Verifies missing fields return `422` naming the missing field
6. `test_database_logging` — Confirms record insertion into `crop_recommendation_logs` with all inputs and outputs
7. `test_internal_error_handling_returns_500` — Verifies unexpected exceptions return `500` without stack traces

#### Feature 2: Market Price Comparison (7 Tests)
8. `test_valid_market_prices_query` — Verifies `crop=rice` returns `200` with markets sorted by `modal_price` descending and `distance_km: null`
9. `test_missing_crop_parameter_returns_422` — Verifies missing `crop` query parameter returns `422`
10. `test_unrecognized_crop_returns_422` — Verifies unrecognized crop returns `422` naming valid crop options
11. `test_non_matching_state_returns_empty_markets_200` — Verifies non-matching state returns `200` with `markets: []` and `best_price_market: null`
12. `test_state_filter_case_insensitive` — Verifies `state=maharashtra`, `state=MAHARASHTRA`, `state=Maharashtra` return identical results
13. `test_crop_query_case_insensitive` — Verifies crop queries work case-insensitively (`crop=RICE`)
14. `test_limit_query_parameter` — Verifies `limit` restricts returned market count

---

## 📁 Repository Structure

```
.
├── docker-compose.yml           # Multi-service orchestration (Backend + PostgreSQL)
├── .env.example                 # Environment configuration template
├── .env                         # Environment settings (default: Postgres)
├── README.md                    # Backend documentation & API contracts
└── backend/
    ├── Dockerfile               # Production container with build-time ML training
    ├── requirements.txt         # Pinned production dependencies
    ├── app/
    │   ├── main.py              # FastAPI entrypoint, CORS, lifespan, DB seed
    │   ├── api/
    │   │   ├── health.py        # GET /api/health route
    │   │   ├── crop_recommendation.py  # POST /api/crop-recommendation route
    │   │   └── market_price.py  # GET /api/market-prices route
    │   ├── core/
    │   │   ├── config.py        # Settings via pydantic-settings
    │   │   ├── constants.py     # Shared VALID_CROPS constant (single source of truth)
    │   │   └── database.py      # SQLAlchemy engine & session dependency
    │   ├── db/
    │   │   └── seed_market_prices.py   # Seeding service (20 mandis across 5 states)
    │   ├── models/
    │   │   ├── crop_recommendation.py  # CropRecommendationLog DB model
    │   │   └── market.py        # Market and MarketPrice DB models
    │   ├── schemas/
    │   │   ├── health.py        # Health response schema
    │   │   ├── crop_recommendation.py  # Crop recommendation schemas
    │   │   └── market_price.py  # Market price comparison schemas
    │   └── ml/
    │       ├── data/
    │       │   └── crop_recommendation.csv # 2,200 row verified dataset
    │       ├── train_crop_model.py         # Standalone training script
    │       ├── predictor.py                # In-memory inference service
    │       └── artifacts/
    │           ├── crop_rf_model.joblib    # Serialized model bundle
    │           └── model_metadata.json     # Model training metrics
    └── tests/
        ├── conftest.py          # Isolated SQLite test fixtures & seed data
        ├── test_crop_recommendation.py     # Feature 1 test suite (7 tests)
        └── test_market_prices.py           # Feature 2 test suite (7 tests)
```
