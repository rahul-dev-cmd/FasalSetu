"""
Farmer Q&A Schemas
==================
Pydantic schemas for the Farmer Q&A Assistant request and response contract.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class FarmerQARequest(BaseModel):
    question: str = Field(
        ...,
        description="Farming question in Hindi, English, or any Indian regional language (minimum 3 characters)",
        examples=["गेहूं की बुवाई का सही समय क्या है?", "How to control stem borer pest in maize?"]
    )
    language: Optional[str] = Field(
        None,
        description="Optional language hint (e.g. 'hindi', 'english', 'bengali', 'tamil', 'marathi', 'punjabi', 'gujarati'). If omitted, language is automatically detected.",
        examples=["hindi", "english"]
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 3:
            raise ValueError("question must be at least 3 characters long")
        return cleaned

    model_config = {
        "json_schema_extra": {
            "example": {
                "question": "टमाटर में फल छेदक कीट की रोकथाम कैसे करें?",
                "language": "hindi"
            }
        }
    }


class FarmerQAResponse(BaseModel):
    answer: str = Field(..., description="Practical agricultural guidance response in the requested/detected language")
    language_used: str = Field(..., description="Language used for the response (e.g. 'Hindi', 'English')")
    disclaimer: str = Field(..., description="Standard advisory disclaimer")
    is_farming_related: bool = Field(..., description="True if the question is agricultural; False if off-topic")

    model_config = {
        "json_schema_extra": {
            "example": {
                "answer": "टमाटर में फल छेदक कीट के नियंत्रण के लिए नीम तेल (5 मिली प्रति लीटर पानी) का छिड़काव करें और फेरोमोन ट्रैप लगाएं।",
                "language_used": "Hindi",
                "disclaimer": "यह सामान्य कृषि सलाह है। गंभीर समस्या पर अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से संपर्क करें।",
                "is_farming_related": True
            }
        }
    }


class FarmerVoiceQAResponse(BaseModel):
    transcribed_question: str = Field(..., description="Transcribed question text from audio recording")
    answer: str = Field(..., description="Practical agricultural guidance response in the requested/detected language")
    language_used: str = Field(..., description="Language used for the response (e.g. 'Hindi', 'English')")
    disclaimer: str = Field(..., description="Standard advisory disclaimer")
    is_farming_related: bool = Field(..., description="True if the question is agricultural; False if off-topic")

    model_config = {
        "json_schema_extra": {
            "example": {
                "transcribed_question": "टमाटर में फल छेदक कीट का उपचार क्या है?",
                "answer": "टमाटर में फल छेदक (Fruit Borer) कीट के नियंत्रण के लिए नीम तेल (5 मिली प्रति लीटर पानी) का छिड़काव करें और फेरोमोन ट्रैप लगाएं।",
                "language_used": "Hindi",
                "disclaimer": "अस्वीकरण: यह सामान्य कृषि सलाह है। गंभीर कीट प्रकोप या रासायनिक उपयोग से पहले कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से परामर्श लें।",
                "is_farming_related": True
            }
        }
    }

