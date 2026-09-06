import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_auth_email_task(self, subject: str, message: str, recipient_list: list[str], html_message: str = None):
    """
    Celery task to send authentication-related emails asynchronously.
    Retries up to 3 times on temporary network/SMTP failures.
    """
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Farmket <no-reply@farmket.com>')
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Auth email '{subject}' sent successfully to {len(recipient_list)} recipient(s).")
        return sent_count
    except Exception as exc:
        logger.error(f"Failed to send auth email '{subject}' to {recipient_list}: {exc}")
        raise self.retry(exc=exc)
