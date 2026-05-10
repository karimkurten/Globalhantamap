"""AI service for outbreak summaries / risk insights via Claude Sonnet 4.5."""
import os
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
