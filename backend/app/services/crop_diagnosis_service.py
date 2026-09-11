"""
Crop Diagnosis Service
======================
Handles image-based crop disease and pest diagnosis via Groq's multimodal vision endpoint.
Provides visual symptom analysis, confidence assessment, practical treatment recommendations,
and regional language translation with safety disclaimers and 15-second timeouts.
"""

import base64
import json
import logging
import re
from typing import Dict, Any, Optional
from groq import Groq, APIError, APITimeoutError, APIConnectionError

from app.core.config import settings
from app.services.farmer_qa_service import STANDARD_DISCLAIMERS

logger = logging.getLogger("fasalsetu_crop_diagnosis")


class GroqDiagnosisUnavailableException(Exception):
    """Raised when the Groq vision model is unavailable, times out, or fails to parse."""
    pass


DIAGNOSIS_SYSTEM_PROMPT = """You are an expert AI plant pathologist and agricultural advisor for Indian farmers.
You analyze photographs of diseased, damaged, or pest-infested crops and leaves to provide actionable field advice.

CRITICAL INSTRUCTIONS:
1. IDENTIFICATION: Identify the crop/plant and the specific disease, fungal infection, bacterial blight, pest infestation, or nutrient deficiency observed in the image.
2. CONFIDENCE & SYMPTOMS: Describe the key visual symptoms visible in the image (lesions, discoloration, fungal growth, pest damage) and indicate your confidence level (High, Moderate, or Tentative).
3. TREATMENT GUIDANCE: Provide practical, clear, and scientifically sound treatments suitable for Indian farmers:
   - Cultural/physical controls (e.g. pruning infected leaves, sanitation, adjusting irrigation).
   - Biological or organic controls (e.g. neem oil, Trichoderma viride, pheromone traps).
   - Recommended chemical fungicides/pesticides with standard dosage if necessary.
4. LANGUAGE HANDLING: You MUST provide your diagnosis, confidence note, and suggested treatment in the user's requested language hint (e.g. Hindi, English, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati) or detected from their query.
5. STRICT JSON OUTPUT: You MUST respond ONLY with a single valid JSON object. Do not include markdown code block preamble or extra commentary.

Expected JSON Schema:
{
  "diagnosis": "Early Blight (Alternaria solani) in Tomato",
  "confidence_note": "High confidence based on concentric target-like dark brown spots with yellow halos on lower foliage.",
  "suggested_treatment": "1. Remove and destroy infected lower leaves. 2. Avoid overhead irrigation. 3. Spray Mancozeb 75% WP @ 2-2.5g/liter water or Copper Oxychloride 50% WP @ 3g/liter. Repeat after 10-12 days if wet weather persists.",
  "language_used": "English"
}
"""


def parse_diagnosis_json(raw_text: str) -> Dict[str, Any]:
    """
    Parses structured JSON response from vision model with robust fallbacks:
    1. Direct json.loads
    2. Stripping markdown code fences (```json ... ```)
    3. Regex matching for outermost { ... }
    """
    cleaned = raw_text.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Strip code fences
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        stripped = "\n".join(lines).strip()
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

    # Regex search
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    logger.error(f"Failed to parse JSON response from vision model. Raw content: {raw_text[:200]}")
    raise GroqDiagnosisUnavailableException("Failed to parse structured JSON from vision model response")


class CropDiagnosisService:
    """Service managing vision-based crop disease diagnosis via Groq API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_VISION_MODEL
        self._client: Optional[Groq] = None

    def get_client(self) -> Groq:
        if self._client is None:
            if not self.api_key or self.api_key == "gsk_your_groq_api_key_here":
                raise GroqDiagnosisUnavailableException("Groq API key is not configured in environment")
            self._client = Groq(api_key=self.api_key, timeout=15.0)
        return self._client

    def diagnose(
        self,
        image_bytes: bytes,
        image_filename: str,
        question: Optional[str] = None,
        language_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes crop leaf image and optional farmer question through the vision model.
        Returns diagnosis, confidence note, suggested treatment, language, and disclaimer.
        """
        # Determine mime type based on extension
        ext = image_filename.lower().split(".")[-1]
        if ext in ("jpg", "jpeg"):
            mime_type = "image/jpeg"
        elif ext == "png":
            mime_type = "image/png"
        elif ext == "webp":
            mime_type = "image/webp"
        else:
            mime_type = "image/jpeg"

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        image_url = f"data:{mime_type};base64,{b64_image}"

        prompt_text = "Diagnose the disease, pest, or nutrient deficiency shown in this crop image. Provide treatment guidance."
        if question and question.strip():
            prompt_text = f"Farmer's Note/Question: {question.strip()}\n\nPlease examine this plant/leaf image, diagnose the issue, and provide practical treatment advice."

        if language_hint and language_hint.strip():
            prompt_text += f"\nPreferred Language for Response: {language_hint.strip()}"

        user_content = [
            {"type": "text", "text": prompt_text},
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url
                }
            }
        ]

        try:
            client = self.get_client()
            logger.info(
                f"Sending crop diagnosis request to Groq vision model '{self.model}' "
                f"for file '{image_filename}' ({len(image_bytes)} bytes) with 15s timeout"
            )

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": DIAGNOSIS_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2,
                max_tokens=800,
                response_format={"type": "json_object"},
                timeout=15.0  # Explicit 15-second request timeout
            )

            raw_content = response.choices[0].message.content or ""
            parsed = parse_diagnosis_json(raw_content)

            diagnosis = str(parsed.get("diagnosis", "")).strip()
            confidence_note = str(parsed.get("confidence_note", "")).strip()
            suggested_treatment = str(parsed.get("suggested_treatment", "")).strip()
            language_used = str(parsed.get("language_used", language_hint or "English")).strip()

            if not diagnosis:
                raise GroqDiagnosisUnavailableException("Vision model returned an empty diagnosis")

            # Attach standard agricultural disclaimer
            lang_lower = language_used.lower()
            if "hindi" in lang_lower or "हिन्दी" in lang_lower:
                disclaimer = STANDARD_DISCLAIMERS["hindi"]
            else:
                disclaimer = STANDARD_DISCLAIMERS["english"]

            return {
                "diagnosis": diagnosis,
                "confidence_note": confidence_note or "Visual inspection of leaf/plant symptoms.",
                "suggested_treatment": suggested_treatment or "Consult your local agricultural extension office (KVK) for specialized treatment.",
                "language_used": language_used,
                "disclaimer": disclaimer,
                "model_used": self.model
            }

        except (APITimeoutError, TimeoutError) as exc:
            logger.error(f"Groq vision API request timed out after 15 seconds: {exc}")
            raise GroqDiagnosisUnavailableException("Vision model request timed out") from exc
        except (APIConnectionError, APIError) as exc:
            # Handles API connection errors, rate limits, model_decommissioned, or service outages
            logger.error(f"Groq vision API error encountered: {exc}")
            raise GroqDiagnosisUnavailableException(f"Vision model service unavailable: {exc}") from exc
        except GroqDiagnosisUnavailableException:
            raise
        except Exception as exc:
            logger.error(f"Unexpected error communicating with vision model: {exc}", exc_info=True)
            raise GroqDiagnosisUnavailableException("Crop diagnosis service unavailable") from exc


# Singleton instance
crop_diagnosis_service = CropDiagnosisService()
