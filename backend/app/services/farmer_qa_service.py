"""
Farmer Q&A Assistant Service
============================
Integrates with the Groq API (llama-3.1-8b-instant) to provide regional language,
farming-scoped agricultural guidance with robust JSON parsing fallback and explicit timeouts.
"""

import json
import re
import logging
from typing import Dict, Any, Optional, List
from groq import Groq, APIError, APITimeoutError, APIConnectionError

from app.core.config import settings
from app.core.constants import MAX_CONVERSATION_HISTORY, MAX_HISTORY_ANSWER_LENGTH

logger = logging.getLogger("fasalsetu_qa_service")


class GroqServiceUnavailableException(Exception):
    """Raised when Groq API is unreachable, times out, or returns unparseable output."""
    pass


class GroqTranscriptionUnavailableException(Exception):
    """Raised when Groq Whisper speech-to-text is unreachable, times out, or fails."""
    pass


WHISPER_LANGUAGE_CODES = {
    "hindi": "hi",
    "english": "en",
    "bengali": "bn",
    "tamil": "ta",
    "telugu": "te",
    "marathi": "mr",
    "gujarati": "gu",
    "punjabi": "pa",
    "kannada": "kn",
    "malayalam": "ml",
    "urdu": "ur",
    "odia": "or"
}


SYSTEM_PROMPT = """You are FasalSetu's Farmer Q&A Assistant, an AI agricultural advisory expert designed specifically for Indian farmers.


CORE DIRECTIVES:
1. TOPIC SCOPE: You answer ONLY questions related to agriculture, farming, crops, seeds, plant protection, pest & disease control, soil health, irrigation, fertilizers, organic farming, weather impact, and livestock/farm animal management.
2. OFF-TOPIC HANDLING: If the user's question is NOT related to agriculture or farming (e.g. general chit-chat, politics, coding, sports, movies, academic math/history, financial speculation):
   - Set "is_farming_related" to false.
   - For "answer", provide a polite, respectful message in the question's language explaining that you are an agricultural assistant and can only answer farming-related questions, and gently invite them to ask an agricultural query.
3. LANGUAGE HANDLING: You MUST respond in the EXACT SAME language that the user asked in (e.g. Hindi, English, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati, etc.), or the requested language hint if provided.
4. TONE & CONTENT: Provide clear, practical, concise, and scientifically sound advice that a farmer can understand and implement in the field.
5. STRICT JSON OUTPUT: You must respond ONLY with a single valid JSON object. Do not include markdown preamble or trailing text.
Expected JSON Schema:
{
  "is_farming_related": true,
  "language_used": "Hindi",
  "answer": "फसल के कीट नियंत्रण के लिए..."
}
"""

STANDARD_DISCLAIMERS = {
    "hindi": "अस्वीकरण: यह सामान्य कृषि सलाह है। गंभीर कीट प्रकोप या रासायनिक उपयोग से पहले कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से परामर्श लें।",
    "english": "Disclaimer: This is general agricultural guidance. For critical crop decisions or severe disease outbreaks, please consult your local Krishi Vigyan Kendra (KVK) or an agricultural extension expert."
}


def parse_model_json(raw_text: str) -> Dict[str, Any]:
    """
    Parses JSON output from LLM with robust fallback:
    1. Direct json.loads
    2. Strips markdown fences (```json ... ```)
    3. Locates outermost JSON object via regex
    Raises GroqServiceUnavailableException if all parsing attempts fail.
    """
    cleaned = raw_text.strip()
    
    # 1. Direct parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
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

    # 3. Regex fallback to extract outermost JSON object { ... }
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # If all parsing attempts fail, treat as service degradation/malformed output
    logger.error(f"Failed to parse JSON response from Groq. Raw output: {raw_text[:200]}")
    raise GroqServiceUnavailableException("Failed to parse structured JSON from LLM response")


class FarmerQAService:
    """Manages interactions with Groq API for agricultural question answering."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        whisper_model: Optional[str] = None
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.whisper_model = whisper_model or settings.GROQ_WHISPER_MODEL
        self._client: Optional[Groq] = None

    def get_client(self) -> Groq:
        if self._client is None:
            if not self.api_key or self.api_key == "gsk_your_groq_api_key_here":
                raise GroqServiceUnavailableException("Groq API key is not configured in environment")
            # Explicit timeout of 15 seconds as specified in requirements
            self._client = Groq(api_key=self.api_key, timeout=15.0)
        return self._client

    def transcribe_audio(
        self,
        file_bytes: bytes,
        filename: str,
        language_hint: Optional[str] = None
    ) -> str:
        """
        Transcribes audio bytes via Groq's Whisper endpoint (whisper-large-v3-turbo)
        with an explicit 15-second timeout.
        Returns the transcribed text or raises GroqTranscriptionUnavailableException.
        """
        try:
            client = self.get_client()
        except GroqServiceUnavailableException as exc:
            logger.error(f"Cannot transcribe audio: {exc}")
            raise GroqTranscriptionUnavailableException("Groq client unavailable for transcription") from exc

        # Resolve optional language hint to ISO-639-1 code if known
        iso_lang = None
        if language_hint and language_hint.strip():
            hint_clean = language_hint.strip().lower()
            iso_lang = WHISPER_LANGUAGE_CODES.get(hint_clean, hint_clean if len(hint_clean) == 2 else None)

        try:
            logger.info(
                f"Transcribing audio '{filename}' ({len(file_bytes)} bytes) using Whisper model '{self.whisper_model}' "
                f"with 15s timeout, language_hint='{iso_lang}'"
            )

            kwargs: Dict[str, Any] = {
                "model": self.whisper_model,
                "file": (filename, file_bytes),
                "response_format": "json",
                "timeout": 15.0  # Explicit 15-second request timeout
            }
            if iso_lang:
                kwargs["language"] = iso_lang

            transcription = client.audio.transcriptions.create(**kwargs)
            transcribed_text = (getattr(transcription, "text", "") or "").strip()

            if not transcribed_text:
                logger.warning(f"Whisper transcription returned empty text for '{filename}'")
                raise GroqTranscriptionUnavailableException("Empty transcription returned from audio")

            logger.info(f"Transcription successful for '{filename}': '{transcribed_text[:80]}...'")
            return transcribed_text

        except (APITimeoutError, TimeoutError) as exc:
            logger.error(f"Groq Whisper transcription timed out after 15 seconds: {exc}")
            raise GroqTranscriptionUnavailableException("Groq Whisper transcription timed out") from exc
        except (APIConnectionError, APIError) as exc:
            logger.error(f"Groq Whisper API error: {exc}")
            raise GroqTranscriptionUnavailableException("Groq Whisper transcription service unavailable") from exc
        except GroqTranscriptionUnavailableException:
            raise
        except Exception as exc:
            logger.error(f"Unexpected error during audio transcription: {exc}", exc_info=True)
            raise GroqTranscriptionUnavailableException("Audio transcription failed") from exc

    def ask(
        self,
        question: str,
        language_hint: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Sends user question to Groq LLM with a 15-second timeout and returns structured response.
        If history is provided, loops over entries (up to MAX_CONVERSATION_HISTORY) in oldest-to-newest
        order, formatting each as 'Previous Question / Previous Answer' pairs, and prepending them
        to the prompt context.
        """
        history_blocks = []
        if history:
            # Enforce maximum history cap of MAX_CONVERSATION_HISTORY (last N turns)
            # and format each entry in oldest-to-newest order
            selected_history = history[-MAX_CONVERSATION_HISTORY:]
            for turn in selected_history:
                q = turn.get("question", "").strip()
                a = turn.get("answer", "").strip()
                if len(a) > MAX_HISTORY_ANSWER_LENGTH:
                    a = a[:MAX_HISTORY_ANSWER_LENGTH] + "..."
                history_blocks.append(f"Previous Question: {q}\nPrevious Answer: {a}")

        if history_blocks:
            history_str = "\n\n".join(history_blocks)
            user_prompt = (
                f"Recent Conversation Context:\n"
                f"{history_str}\n\n"
                f"Current Farmer's Question: {question.strip()}"
            )
        else:
            user_prompt = f"Farmer's Question: {question.strip()}"

        if language_hint and language_hint.strip():
            user_prompt += f"\nPreferred Language: {language_hint.strip()}"


        try:
            client = self.get_client()
            logger.info(f"Querying Groq model '{self.model}' with 15s timeout for question: '{question[:60]}...'")

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=600,
                response_format={"type": "json_object"},
                timeout=15.0  # Explicit 15-second request timeout
            )

            raw_content = response.choices[0].message.content or ""
            parsed = parse_model_json(raw_content)

            is_farming_related = bool(parsed.get("is_farming_related", True))
            language_used = str(parsed.get("language_used", language_hint or "Hindi")).strip()
            answer = str(parsed.get("answer", "")).strip()

            if not answer:
                raise GroqServiceUnavailableException("Empty answer returned from assistant")

            # Determine appropriate disclaimer
            lang_lower = language_used.lower()
            if "hindi" in lang_lower or "हिन्दी" in lang_lower:
                disclaimer = STANDARD_DISCLAIMERS["hindi"]
            else:
                disclaimer = STANDARD_DISCLAIMERS["english"]

            return {
                "answer": answer,
                "language_used": language_used,
                "disclaimer": disclaimer,
                "is_farming_related": is_farming_related,
                "model_used": self.model
            }

        except (APITimeoutError, TimeoutError) as exc:
            logger.error(f"Groq API request timed out after 15 seconds: {exc}")
            raise GroqServiceUnavailableException("Groq API request timed out") from exc
        except (APIConnectionError, APIError) as exc:
            logger.error(f"Groq API error encountered: {exc}")
            raise GroqServiceUnavailableException("Groq API service unavailable") from exc
        except GroqServiceUnavailableException:
            raise
        except Exception as exc:
            logger.error(f"Unexpected error communicating with Groq: {exc}", exc_info=True)
            raise GroqServiceUnavailableException("Assistant service unavailable") from exc


# Singleton instance
farmer_qa_service = FarmerQAService()
