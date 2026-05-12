"""AI service for outbreak summaries / risk insights via Claude Sonnet 4.5."""
import os
import json
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def generate_outbreak_summary(prompt: str, system: Optional[str] = None) -> str:
    """Generate an AI summary using Claude Sonnet 4.5 via Emergent integrations."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return "AI summaries are temporarily unavailable (missing key)."
        sys_msg = system or (
            "You are an epidemiology analyst writing for a public health surveillance platform. "
            "Produce concise (max 90 words), factual, neutral outbreak summaries citing the country and source. "
            "Never fabricate numbers; only restate the data provided. Avoid alarmist language."
        )
        chat = LlmChat(
            api_key=api_key,
            session_id=f"hanta-summary-{os.urandom(4).hex()}",
            system_message=sys_msg,
        ).with_model("anthropic", "claude-sonnet-4-5").with_max_tokens(400)
        user = UserMessage(text=prompt)
        response = await chat.send_message(user)
        return str(response).strip()
    except Exception as e:
        logger.exception("AI summary failed: %s", e)
        return "AI summary is temporarily unavailable. Please refer to the source links for the latest official data."


async def extract_outbreak_from_article(title: str, body: str) -> Optional[dict]:
    """Use Claude to extract structured outbreak figures from an official article.

    Returns a dict with keys: country, country_code, confirmed_cases, deaths,
    suspected_cases, recovered, severity, advisory, confidence (0-1).
    Returns None if no extractable outbreak data was found.
    STRICT: only numbers EXPLICITLY stated in the source text.
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return None

        system = (
            "You are an epidemiology data extractor for a Hantavirus surveillance platform. "
            "Read the official article and extract STRUCTURED outbreak data. "
            "STRICT RULES: "
            "1. Only extract numbers that are EXPLICITLY stated in the article. "
            "2. If a field is not stated, set it to null - NEVER guess or estimate. "
            "3. If the article is not about Hantavirus, return {\"is_hantavirus\": false}. "
            "4. Set confidence between 0 and 1 based on how explicit the numbers are. "
            "Respond with ONLY valid JSON, no markdown, no explanation."
        )

        prompt = (
            "Extract structured Hantavirus outbreak data from this article as JSON with fields: "
            "is_hantavirus (boolean), country (string or null), country_code (ISO-2 like 'AR', 'US', or null), "
            "confirmed_cases (integer or null), suspected_cases (integer or null), "
            "deaths (integer or null), recovered (integer or null), "
            "severity (one of: 'low', 'moderate', 'high', or null - high if any deaths/large outbreak mentioned), "
            "advisory (one-sentence official advisory if mentioned, or null), "
            "confidence (0.0 to 1.0).\n\n"
            f"TITLE: {title}\n\nARTICLE:\n{body[:3500]}"
        )

        chat = LlmChat(
            api_key=api_key,
            session_id=f"hanta-extract-{os.urandom(4).hex()}",
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5").with_max_tokens(500)

        response = await chat.send_message(UserMessage(text=prompt))
        text = str(response).strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
        data = json.loads(text)

        if not data.get("is_hantavirus") or not data.get("country"):
            return None
        if data.get("confidence", 0) < 0.5:
            return None
        if not any(data.get(k) for k in ("confirmed_cases", "suspected_cases", "deaths")):
            return None
        return data
    except json.JSONDecodeError as e:
        logger.warning("AI extraction returned non-JSON: %s", e)
        return None
    except Exception as e:
        logger.exception("AI outbreak extraction failed: %s", e)
        return None
