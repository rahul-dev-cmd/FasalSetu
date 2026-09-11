"""
FasalSetu Crop Recommendation Model Training Script
===================================================
Trains a multi-class classifier to recommend the best crop based on 7 soil & weather features:
- N (Nitrogen in soil)
- P (Phosphorus in soil)
- K (Potassium in soil)
- temperature (°C)
- humidity (%)
- ph (soil pH)
- rainfall (mm)

Dataset: Public 'Crop Recommendation Dataset' by Atharva Ingle (Kaggle), 2,200 rows, 22 crops.
Model: Random Forest Classifier (achieves >99% test accuracy).
Artifact: Saves trained model, classes, and feature mapping to disk using joblib.
"""

import os
import sys
import logging
from pathlib import Path
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

from app.core.constants import VALID_CROPS_SET

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fasalsetu_training")

FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET_COLUMN = "label"

CURRENT_DIR = Path(__file__).resolve().parent
DATA_DIR = CURRENT_DIR / "data"
ARTIFACTS_DIR = CURRENT_DIR / "artifacts"
CSV_PATH = DATA_DIR / "crop_recommendation.csv"
MODEL_PATH = ARTIFACTS_DIR / "crop_rf_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"


def generate_synthetic_data(num_samples_per_crop: int = 100) -> pd.DataFrame:
    """
    Fallback generator: Generates a synthetic dataset with realistic agronomic ranges
    for each of the 22 target crops if the primary dataset cannot be loaded.
    """
    logger.warning("SYNTHETIC DATA USED: Generating synthetic agronomic dataset as fallback.")
    np.random.seed(42)
    
    crops_ranges = {
        "rice": {"N": (60, 100), "P": (35, 60), "K": (35, 45), "temp": (20, 27), "hum": (80, 85), "ph": (5.0, 7.0), "rain": (180, 300)},
        "maize": {"N": (60, 100), "P": (35, 60), "K": (15, 25), "temp": (18, 27), "hum": (55, 75), "ph": (5.5, 7.0), "rain": (60, 110)},
        "chickpea": {"N": (20, 60), "P": (55, 80), "K": (75, 85), "temp": (17, 20), "hum": (14, 20), "ph": (6.0, 8.5), "rain": (65, 95)},
        "kidneybeans": {"N": (10, 40), "P": (55, 80), "K": (15, 25), "temp": (15, 24), "hum": (18, 25), "ph": (5.5, 6.0), "rain": (60, 150)},
        "pigeonpeas": {"N": (10, 40), "P": (55, 80), "K": (15, 25), "temp": (27, 38), "hum": (45, 70), "ph": (4.5, 7.5), "rain": (90, 200)},
        "mothbeans": {"N": (10, 40), "P": (35, 60), "K": (15, 25), "temp": (24, 32), "hum": (40, 65), "ph": (3.5, 9.9), "rain": (30, 75)},
        "mungbean": {"N": (10, 40), "P": (35, 60), "K": (15, 25), "temp": (27, 30), "hum": (80, 90), "ph": (6.2, 7.2), "rain": (35, 60)},
        "blackgram": {"N": (30, 60), "P": (55, 80), "K": (15, 25), "temp": (25, 35), "hum": (60, 70), "ph": (6.5, 7.5), "rain": (60, 75)},
        "lentil": {"N": (10, 40), "P": (55, 80), "K": (15, 25), "temp": (18, 30), "hum": (60, 70), "ph": (6.5, 7.5), "rain": (35, 55)},
        "pomegranate": {"N": (10, 40), "P": (10, 40), "K": (35, 45), "temp": (18, 25), "hum": (85, 95), "ph": (5.5, 7.2), "rain": (100, 115)},
        "banana": {"N": (80, 120), "P": (70, 95), "K": (45, 55), "temp": (25, 30), "hum": (75, 85), "ph": (5.5, 6.5), "rain": (90, 120)},
        "mango": {"N": (10, 40), "P": (15, 40), "K": (25, 35), "temp": (27, 36), "hum": (45, 55), "ph": (4.5, 7.0), "rain": (85, 105)},
        "grapes": {"N": (10, 40), "P": (120, 145), "K": (195, 205), "temp": (8, 42), "hum": (80, 85), "ph": (5.5, 6.5), "rain": (65, 75)},
        "watermelon": {"N": (80, 120), "P": (5, 30), "K": (45, 55), "temp": (24, 27), "hum": (80, 90), "ph": (6.0, 7.0), "rain": (40, 60)},
        "muskmelon": {"N": (80, 120), "P": (5, 30), "K": (45, 55), "temp": (27, 30), "hum": (90, 95), "ph": (6.0, 6.8), "rain": (20, 30)},
        "apple": {"N": (10, 40), "P": (120, 145), "K": (195, 205), "temp": (21, 24), "hum": (90, 95), "ph": (5.5, 6.5), "rain": (100, 125)},
        "orange": {"N": (10, 40), "P": (5, 30), "K": (5, 15), "temp": (10, 35), "hum": (90, 95), "ph": (6.0, 7.5), "rain": (100, 120)},
        "papaya": {"N": (40, 60), "P": (55, 75), "K": (45, 55), "temp": (23, 44), "hum": (90, 95), "ph": (6.5, 7.0), "rain": (140, 250)},
        "coconut": {"N": (10, 40), "P": (5, 30), "K": (25, 35), "temp": (25, 29), "hum": (90, 100), "ph": (5.5, 6.5), "rain": (130, 225)},
        "cotton": {"N": (100, 140), "P": (35, 60), "K": (15, 25), "temp": (22, 26), "hum": (75, 85), "ph": (6.0, 8.0), "rain": (60, 100)},
        "jute": {"N": (60, 100), "P": (35, 60), "K": (35, 45), "temp": (23, 26), "hum": (70, 90), "ph": (6.0, 7.5), "rain": (150, 200)},
        "coffee": {"N": (80, 120), "P": (15, 40), "K": (25, 35), "temp": (23, 28), "hum": (50, 70), "ph": (6.0, 7.5), "rain": (115, 200)}
    }

    rows = []
    for crop, r in crops_ranges.items():
        for _ in range(num_samples_per_crop):
            rows.append({
                "N": np.random.uniform(r["N"][0], r["N"][1]),
                "P": np.random.uniform(r["P"][0], r["P"][1]),
                "K": np.random.uniform(r["K"][0], r["K"][1]),
                "temperature": np.random.uniform(r["temp"][0], r["temp"][1]),
                "humidity": np.random.uniform(r["hum"][0], r["hum"][1]),
                "ph": np.random.uniform(r["ph"][0], r["ph"][1]),
                "rainfall": np.random.uniform(r["rain"][0], r["rain"][1]),
                "label": crop
            })
    return pd.DataFrame(rows)


def load_data() -> pd.DataFrame:
    """Loads crop recommendation dataset from disk or falls back to synthetic data."""
    if CSV_PATH.exists():
        logger.info(f"Loading real dataset from {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
        logger.info(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    else:
        logger.warning(f"Dataset not found at {CSV_PATH}. Using synthetic dataset fallback.")
        df = generate_synthetic_data(num_samples_per_crop=100)
    return df


def train():
    """Trains the crop recommendation Random Forest model and saves artifacts."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    df = load_data()

    missing_cols = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    logger.info(f"Feature matrix shape: {X.shape}, Target classes: {y.nunique()}")

    # 80/20 train/test split, stratified by crop label
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    logger.info(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

    # Multi-class Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    logger.info("Fitting Random Forest classifier...")
    rf_model.fit(X_train, y_train)

    y_pred = rf_model.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    logger.info(f"Test Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    if accuracy < 0.95:
        logger.warning(f"ATTENTION: Model accuracy {accuracy:.4f} is below expected threshold 0.95!")
    else:
        logger.info("Model accuracy exceeds 95% threshold successfully.")

    report = classification_report(y_test, y_pred, output_dict=True)

    # Prepare bundle with model, class list, and feature names
    classes_list = list(rf_model.classes_)
    bundle = {
        "model": rf_model,
        "classes": classes_list,
        "feature_names": FEATURE_COLUMNS,
        "accuracy": accuracy,
        "num_classes": len(classes_list)
    }

    joblib.dump(bundle, MODEL_PATH)
    logger.info(f"Model bundle saved to {MODEL_PATH}")

    # Also save human-readable metadata
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "accuracy": accuracy,
        "features": FEATURE_COLUMNS,
        "classes": classes_list,
        "num_classes": len(classes_list),
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0])
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Metadata saved to {METADATA_PATH}")

    return accuracy


if __name__ == "__main__":
    train()
