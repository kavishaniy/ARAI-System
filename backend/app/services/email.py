import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False


def _get_settings():
    from app.core.config import settings
    return settings


def _build_invite_html(project_name: str, inviter_email: str, frontend_url: str, user_exists: bool) -> str:
    cta_url = f"{frontend_url}/projects" if user_exists else f"{frontend_url}/signup"
    cta_label = "View Project" if user_exists else "Sign Up & Collaborate"
    note = (
        "You now have editor access to this project."
        if user_exists
        else "Sign up for a free ARAI account to accept this invitation and start collaborating."
    )
    return f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#0f2557;background:#fff;border-radius:10px;border:1px solid #e8ecf4;">
  <h2 style="margin-top:0;color:#0f2557;">Collaboration Invitation</h2>
  <p>Hi there,</p>
  <p><strong>{inviter_email}</strong> has invited you to collaborate on the project <strong>"{project_name}"</strong> in ARAI.</p>
  <p style="color:#555;font-size:0.9rem;">{note}</p>
  <a href="{cta_url}"
     style="display:inline-block;margin:20px 0;padding:12px 28px;background:#0f2557;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:0.95rem;">
    {cta_label}
  </a>
  <hr style="border:none;border-top:1px solid #e8ecf4;margin:28px 0 16px;" />
  <p style="color:#aaa;font-size:0.75rem;margin:0;">ARAI &mdash; Accessibility Readability Attention Index</p>
</div>
"""


def _build_invite_text(project_name: str, inviter_email: str, frontend_url: str, user_exists: bool) -> str:
    cta_url = f"{frontend_url}/projects" if user_exists else f"{frontend_url}/signup"
    note = (
        "You now have editor access to this project."
        if user_exists
        else "Sign up at the link below to accept this invitation."
    )
    return (
        f'{inviter_email} has invited you to collaborate on "{project_name}" in ARAI.\n\n'
        f"{note}\n\n"
        f"{cta_url}\n\n"
        "ARAI — Accessibility Readability Attention Index"
    )


async def send_collaboration_invite(
    to_email: str,
    project_name: str,
    inviter_email: str,
    user_exists: bool = True,
) -> bool:
    """
    Send a project collaboration invitation email.
    Returns True if sent, False if no email service is configured (non-fatal).
    """
    try:
        settings = _get_settings()
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
        from_email = getattr(settings, "FROM_EMAIL", "noreply@arai-system.com")
        subject = f"You've been invited to collaborate on \"{project_name}\""

        html_body = _build_invite_html(project_name, inviter_email, frontend_url, user_exists)
        text_body = _build_invite_text(project_name, inviter_email, frontend_url, user_exists)

        sendgrid_key = getattr(settings, "SENDGRID_API_KEY", None)
        smtp_host = getattr(settings, "SMTP_HOST", None)

        if SENDGRID_AVAILABLE and sendgrid_key:
            _send_via_sendgrid(to_email, subject, html_body, from_email, sendgrid_key)
        elif smtp_host:
            _send_via_smtp(to_email, subject, html_body, text_body, from_email, settings)
        else:
            logger.info(
                "📧 [NO EMAIL SERVICE] Invite would be sent to %s for project '%s'. "
                "Set SENDGRID_API_KEY or SMTP_HOST to enable real emails.",
                to_email,
                project_name,
            )
            return False

        logger.info("✅ Collaboration invite sent to %s", to_email)
        return True

    except Exception as exc:
        logger.error("❌ Failed to send collaboration invite to %s: %s", to_email, str(exc))
        return False


def _send_via_sendgrid(to_email: str, subject: str, html_body: str, from_email: str, api_key: str):
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_body,
    )
    sg = SendGridAPIClient(api_key)
    response = sg.send(message)
    logger.info("SendGrid response status: %s", response.status_code)


def _send_via_smtp(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    from_email: str,
    settings,
):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    smtp_host = settings.SMTP_HOST
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USERNAME", None)
    smtp_pass = getattr(settings, "SMTP_PASSWORD", None)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_email, msg.as_string())
