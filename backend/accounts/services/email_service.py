import logging
from django.conf import settings
from django.core.mail import send_mail
from accounts.tasks import send_auth_email_task

logger = logging.getLogger(__name__)


def _dispatch_email(subject: str, plain_text: str, recipient_email: str, html_message: str = None) -> None:
    """
    Dispatches email via Celery async worker when available, or gracefully
    falls back to synchronous send_mail during development if Redis/Celery is offline.
    """
    recipient_list = [recipient_email]

    # If running eagerly (e.g. testing or explicit eager mode)
    if getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False):
        try:
            send_auth_email_task(
                subject=subject,
                message=plain_text,
                recipient_list=recipient_list,
                html_message=html_message,
            )
            return
        except Exception as exc:
            logger.warning(f"Eager send failed ({exc}). Falling back to send_mail.")

    try:
        send_auth_email_task.apply_async(
            kwargs={
                'subject': subject,
                'message': plain_text,
                'recipient_list': recipient_list,
                'html_message': html_message,
            },
            retry=False,
        )
    except Exception as exc:
        logger.warning(
            f"Celery queue unavailable for auth email ({exc}). Dispatching synchronously via fallback."
        )
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Farmket <no-reply@farmket.com>')
            send_mail(
                subject=subject,
                message=plain_text,
                from_email=from_email,
                recipient_list=recipient_list,
                html_message=html_message,
                fail_silently=True,
            )
        except Exception as sync_exc:
            logger.error(f"Failed to send fallback auth email to {recipient_email}: {sync_exc}")



def _render_email_html(headline: str, body_text: str, cta_url: str, cta_text: str, note: str = "") -> str:
    """
    Constructs a responsive, branded HTML email template for Farmket notifications.
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{headline}</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .brand {{ display: inline-block; font-size: 24px; font-weight: 800; color: #10b981; text-decoration: none; margin-bottom: 24px; }}
        .headline {{ font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px; }}
        .body {{ font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 28px; }}
        .btn {{ display: inline-block; background-color: #10b981; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 9999px; text-align: center; }}
        .note {{ font-size: 13px; color: #9ca3af; margin-top: 28px; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 20px; }}
        .code-box {{ background-color: #f3f4f6; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 14px; word-break: break-all; margin: 16px 0; color: #374151; }}
      </style>
    </head>
    <body>
      <div class="container">
        <a href="{settings.FRONTEND_BASE_URL}" class="brand">🌱 Farmket</a>
        <div class="headline">{headline}</div>
        <div class="body">{body_text}</div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{cta_url}" class="btn" target="_blank">{cta_text}</a>
        </div>
        <div class="note">
          <p>If the button above does not work, copy and paste this link into your browser:</p>
          <div class="code-box">{cta_url}</div>
          {f"<p>{note}</p>" if note else ""}
        </div>
      </div>
    </body>
    </html>
    """


class EmailService:
    """
    Centralized email delivery service for authentication events.
    """

    @staticmethod
    def send_verification_email(user, token: str) -> None:
        cta_url = f"{settings.FRONTEND_BASE_URL}/verify-email?token={token}"
        headline = "Verify your Farmket Email"
        body_text = (
            f"Hello {user.first_name or user.username},<br><br>"
            "Thank you for creating an account on Farmket. Please verify your email address "
            "to secure your account and unlock all marketplace and farming features."
        )
        note = "This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email."
        
        plain_text = (
            f"Hello {user.first_name or user.username},\n\n"
            f"Please verify your Farmket email address by visiting this link:\n{cta_url}\n\n"
            "This link will expire in 24 hours."
        )
        html_content = _render_email_html(headline, body_text, cta_url, "Verify Email Address", note)
        
        _dispatch_email(
            subject="Verify your Farmket email address",
            plain_text=plain_text,
            recipient_email=user.email,
            html_message=html_content,
        )

    @staticmethod
    def send_password_reset_email(user, token: str) -> None:
        cta_url = f"{settings.FRONTEND_BASE_URL}/reset-password?token={token}"
        headline = "Reset your Farmket Password"
        body_text = (
            f"Hello {user.first_name or user.username},<br><br>"
            "We received a request to reset the password for your Farmket account. "
            "Click the button below to choose a new, secure password."
        )
        note = "For your security, this password reset link is valid for 1 hour only. If you did not request a password reset, please ignore this email or review your account security."
        
        plain_text = (
            f"Hello {user.first_name or user.username},\n\n"
            f"Reset your Farmket password by opening this link:\n{cta_url}\n\n"
            "This link is single-use and will expire in 1 hour. If you did not request this, please ignore this message."
        )
        html_content = _render_email_html(headline, body_text, cta_url, "Reset Password", note)
        
        _dispatch_email(
            subject="Reset your Farmket password",
            plain_text=plain_text,
            recipient_email=user.email,
            html_message=html_content,
        )

    @staticmethod
    def send_email_change_verification(user, new_email: str, token: str) -> None:
        cta_url = f"{settings.FRONTEND_BASE_URL}/verify-email-change?token={token}"
        headline = "Confirm your New Email Address"
        body_text = (
            f"Hello {user.first_name or user.username},<br><br>"
            f"You requested to change your Farmket account email to <strong>{new_email}</strong>. "
            "Please confirm this change by clicking the button below."
        )
        note = "This confirmation link will expire in 1 hour. If you did not make this request, please contact support immediately."
        
        plain_text = (
            f"Hello {user.first_name or user.username},\n\n"
            f"Confirm your new email ({new_email}) for Farmket by clicking:\n{cta_url}\n\n"
            "This link will expire in 1 hour."
        )
        html_content = _render_email_html(headline, body_text, cta_url, "Confirm Email Change", note)
        
        _dispatch_email(
            subject="Confirm your new Farmket email address",
            plain_text=plain_text,
            recipient_email=new_email,
            html_message=html_content,
        )


email_service = EmailService()
