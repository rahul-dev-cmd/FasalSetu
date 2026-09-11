"""
FasalSetu Core Constants
========================
Single source of truth for shared domain constants across all features.
"""

from typing import Tuple, FrozenSet

# Canonical list of 22 supported crop labels across ML models and market pricing
VALID_CROPS: Tuple[str, ...] = (
    "rice",
    "maize",
    "chickpea",
    "kidneybeans",
    "pigeonpeas",
    "mothbeans",
    "mungbean",
    "blackgram",
    "lentil",
    "pomegranate",
    "banana",
    "mango",
    "grapes",
    "watermelon",
    "muskmelon",
    "apple",
    "orange",
    "papaya",
    "coconut",
    "cotton",
    "jute",
    "coffee"
)

VALID_CROPS_SET: FrozenSet[str] = frozenset(VALID_CROPS)

# Feature 4: Conversational Follow-ups settings
MAX_CONVERSATION_HISTORY: int = 3
MAX_HISTORY_ANSWER_LENGTH: int = 300

# Feature 5: Image-based Crop Diagnosis settings
ALLOWED_IMAGE_EXTENSIONS: FrozenSet[str] = frozenset([".jpg", ".jpeg", ".png", ".webp"])
MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB maximum upload size
