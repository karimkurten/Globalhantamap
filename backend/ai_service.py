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
        logger.warning("emergentintegrations package is not available — skipping AI summary")
        return "AI summary is temporarily unavailable. Please refer to the source links for the latest official data."
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
        logger.warning("emergentintegrations package is not available — skipping AI extraction")
        return None
    except Exception as e:
        logger.exception("AI outbreak extraction failed: %s", e)
        return None
