"""
FasalSetu Model Predictor Service
=================================
Loads the pre-trained Crop Recommendation Random Forest model once at application startup
and provides real-time inference returning top predicted crop + 2 alternative crops with confidences.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import logging
import joblib
import numpy as np

logger = logging.getLogger("fasalsetu_predictor")

CURRENT_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = CURRENT_DIR / "artifacts" / "crop_rf_model.joblib"


class CropPredictor:
    """Singleton-style predictor service managing in-memory model inference."""
    _instance: Optional["CropPredictor"] = None
    _model_bundle: Optional[Dict[str, Any]] = None

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self.model = None
        self.classes: List[str] = []
        self.feature_names: List[str] = []

    @classmethod
    def get_instance(cls) -> "CropPredictor":
        if cls._instance is None:
            cls._instance = CropPredictor()
        return cls._instance

    def load(self, model_path: Optional[Path] = None):
        """Loads the serialized model artifact into memory."""
        path = model_path or self.model_path
        if not path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {path}. Please ensure train_crop_model.py was executed."
            )
        logger.info(f"Loading FasalSetu Crop Recommendation model from {path}")
        bundle = joblib.load(path)
        self.model = bundle["model"]
        self.classes = list(bundle["classes"])
        self.feature_names = list(bundle.get("feature_names", ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]))
        logger.info(f"Successfully loaded model with {len(self.classes)} crop classes: {self.classes}")

    def is_loaded(self) -> bool:
        return self.model is not None and len(self.classes) > 0

    def predict(
        self,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        temperature: float,
        humidity: float,
        ph: float,
        rainfall: float
    ) -> Dict[str, Any]:
        """
        Executes prediction on 7 agronomic input features.
        
        Returns:
            {
                "recommended_crop": str,
                "confidence": float,
                "alternatives": [
                    {"crop": str, "confidence": float},
                    {"crop": str, "confidence": float}
                ]
            }
        """
        if not self.is_loaded():
            logger.info("Model not in memory; attempting lazy load from disk...")
            try:
                self.load()
            except Exception as e:
                logger.error(f"Failed to lazy load model: {e}")
                raise RuntimeError("Model is not loaded in memory. Cannot perform inference.") from e

        # Input DataFrame in feature order: N, P, K, temperature, humidity, ph, rainfall
        import pandas as pd
        input_df = pd.DataFrame(
            [[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]],
            columns=self.feature_names
        )
        
        # Calculate class probabilities
        probabilities = self.model.predict_proba(input_df)[0]

        # Sort indices in descending order of probability
        top_indices = np.argsort(probabilities)[::-1]

        top_crop_idx = top_indices[0]
        top_crop = str(self.classes[top_crop_idx])
        top_confidence = round(float(probabilities[top_crop_idx]), 4)

        # Get top 2 alternative crops
        alternatives = []
        for idx in top_indices[1:3]:
            alternatives.append({
                "crop": str(self.classes[idx]),
                "confidence": round(float(probabilities[idx]), 4)
            })

        return {
            "recommended_crop": top_crop,
            "confidence": top_confidence,
            "alternatives": alternatives
        }


# Global predictor instance
predictor = CropPredictor.get_instance()
