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
