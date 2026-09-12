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

# Feature 16a: Buyer Profile tag vocabulary and avatar styling
VALID_BUYER_TAGS: Tuple[str, ...] = (
    "Processor",
    "Wholesaler",
    "Retailer",
    "Immediate Payment",
    "Bulk Purchase",
    "Good Reputation",
)
VALID_BUYER_TAGS_SET: FrozenSet[str] = frozenset(VALID_BUYER_TAGS)

AVATAR_PALETTE: Tuple[str, ...] = (
    "#16A34A",  # Emerald green
    "#2563EB",  # Royal blue
    "#D97706",  # Amber
    "#7C3AED",  # Purple
    "#DB2777",  # Pink
    "#0D9488",  # Teal
    "#EA580C",  # Orange
    "#4F46E5",  # Indigo
)


def compute_avatar_initial(company_name: str) -> str:
    """Computes avatar initials from the first letters of up to two words in company_name."""
    words = [w for w in company_name.strip().split() if w]
    if not words:
        return "B"
    if len(words) == 1:
        return words[0][:2].upper()
    return (words[0][0] + words[1][0]).upper()


def compute_avatar_color(company_name: str) -> str:
    """Deterministically selects an avatar color from AVATAR_PALETTE based on company_name."""
    h = sum(ord(c) for c in company_name.strip().lower())
    return AVATAR_PALETTE[h % len(AVATAR_PALETTE)]

