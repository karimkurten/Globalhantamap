"""Email service for outbreak alerts via Resend."""
import os
import asyncio
import logging
import resend

logger = logging.getLogger(__name__)
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://globalhantamap.com")


def _alert_html(news_item: dict) -> str:
    site = PUBLIC_SITE_URL
    severity = (news_item.get("severity") or "low").upper()
    severity_color = {
        "HIGH": "#FF3B30", "MODERATE": "#FF9500", "LOW": "#007AFF",
    }.get(severity, "#737373")
    return f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid #2a2a2a;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #2a2a2a;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#737373;margin-bottom:6px;">Global Hanta Map · Outbreak Alert</div>
          <div style="display:inline-block;padding:3px 10px;border:1px solid {severity_color};color:{severity_color};font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">{news_item.get("tag","ALERT")} · {severity}</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.2;color:#fff;font-weight:900;">{news_item.get("title","")}</h1>
          <p style="margin:0 0 20px 0;color:#cfcfcf;font-size:15px;line-height:1.6;">{news_item.get("summary","")}</p>
          <a href="{site}/news" style="display:inline-block;padding:12px 22px;background:#FF3B30;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Read on Global Hanta Map →</a>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #2a2a2a;color:#737373;font-size:11px;line-height:1.6;">
          Source: {news_item.get("source","Verified public health source")}<br/>
          You receive these alerts because you subscribed at <a href="{site}" style="color:#999;">globalhantamap.com</a>.
          <a href="{site}/about" style="color:#999;">Manage preferences</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


async def send_alert_to_subscribers(news_item: dict, recipients: list[str]) -> dict:
    """Send a news alert to a list of subscribers. Non-blocking via to_thread."""
    if not recipients:
        return {"sent": 0, "skipped": "no_recipients"}
    if not os.environ.get("RESEND_API_KEY"):
        logger.warning("RESEND_API_KEY missing; skipping email send")
        return {"sent": 0, "skipped": "no_api_key"}

    html = _alert_html(news_item)
    subject = f"[{news_item.get('tag','ALERT')}] {news_item.get('title','Outbreak alert')}"
    sent = 0
    failed = 0
    for email in recipients:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [email],
                "subject": subject,
                "html": html,
            }
            await asyncio.to_thread(resend.Emails.send, params)
            sent += 1
        except Exception as e:
            failed += 1
            logger.warning("Resend send failed for %s: %s", email, e)
    return {"sent": sent, "failed": failed, "total": len(recipients)}


async def send_test_email(to: str) -> dict:
    if not os.environ.get("RESEND_API_KEY"):
        return {"ok": False, "error": "RESEND_API_KEY missing"}
    params = {
        "from": SENDER_EMAIL,
        "to": [to],
        "subject": "Test · Global Hanta Map",
        "html": _alert_html({
            "tag": "TEST", "severity": "low",
            "title": "Resend integration test",
            "summary": "If you can read this, outbreak alerts will reach this address.",
            "source": "Global Hanta Map system test",
        }),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"ok": True, "id": result.get("id") if isinstance(result, dict) else None}
    except Exception as e:
        return {"ok": False, "error": str(e)}
