"""
Pydantic Schemas for Feature 5: Image-based Crop Diagnosis
==========================================================
Defines response models and validation structures for crop disease/pest diagnosis.
"""

from pydantic import BaseModel, Field


class CropDiagnosisResponse(BaseModel):
    diagnosis: str = Field(
        ...,
        description="Identified crop disease, pest infestation, or nutrient deficiency",
        examples=["Early Blight (Alternaria solani) in Tomato"]
    )
    confidence_note: str = Field(
        ...,
        description="Observations and confidence level based on visual symptoms",
        examples=["High confidence based on concentric target-like dark brown spots on the lower leaf surface."]
    )
    suggested_treatment: str = Field(
        ...,
        description="Practical, actionable treatment or management guidance for the farmer",
        examples=["Spray Mancozeb 75% WP at 2g per liter of water or Copper Oxychloride 50% WP at 3g per liter. Prune severely infected lower leaves."]
    )
    language_used: str = Field(
        ...,
        description="Language in which the diagnosis and guidance is provided",
        examples=["Hindi", "English"]
    )
    disclaimer: str = Field(
        ...,
        description="Standard agricultural advisory disclaimer",
        examples=["अस्वीकरण: यह सामान्य कृषि सलाह है। गंभीर कीट प्रकोप या रासायनिक उपयोग से पहले कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से परामर्श लें।"]
    )
    session_id: str = Field(
        ...,
        description="Session identifier for chaining conversational follow-up questions",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "diagnosis": "Early Blight (Alternaria solani) in Tomato",
                "confidence_note": "High confidence based on concentric target-like dark brown spots on the lower leaf surface.",
                "suggested_treatment": "Spray Mancozeb 75% WP at 2g per liter of water or Copper Oxychloride 50% WP at 3g per liter. Prune severely infected lower leaves.",
                "language_used": "English",
                "disclaimer": "Disclaimer: This is general agricultural guidance. For critical crop decisions or severe disease outbreaks, please consult your local Krishi Vigyan Kendra (KVK) or an agricultural extension expert.",
                "session_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
    }
