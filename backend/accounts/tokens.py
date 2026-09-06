import hashlib
import secrets
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from .models import SecurityToken

TOKEN_EXPIRIES = {
    'email_verification': timedelta(hours=24),
    'password_reset': timedelta(hours=1),
    'email_change': timedelta(hours=1),
}


def hash_token(raw_token: str) -> str:
    """Computes SHA-256 hash of a plaintext token for secure DB storage."""
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()


def generate_security_token(
    user,
    token_type: str,
    new_email: str = None,
    ip_address: str = None,
    user_agent: str = '',
    expires_in: timedelta = None,
) -> str:
    """
    Generates a cryptographically secure random token, stores its SHA-256 hash
    in the database, and returns the plaintext token to be delivered to the user.
    Any existing unused tokens of the same type for this user are invalidated.
    """
    raw_token = secrets.token_urlsafe(32)
    token_hashed = hash_token(raw_token)
    
    lifetime = expires_in or TOKEN_EXPIRIES.get(token_type, timedelta(hours=1))
    expires_at = timezone.now() + lifetime

    with transaction.atomic():
        # Invalidate existing unused tokens for this user and type
        SecurityToken.objects.filter(
            user=user,
            token_type=token_type,
            used_at__isnull=True,
        ).update(used_at=timezone.now())

        SecurityToken.objects.create(
            user=user,
            token_hash=token_hashed,
            token_type=token_type,
            new_email=new_email,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent[:255] if user_agent else '',
        )

    return raw_token


def validate_security_token(raw_token: str, token_type: str) -> SecurityToken | None:
    """
    Validates a raw token against the database:
    - Verifies hash matches
    - Verifies token type matches
    - Verifies not yet used
    - Verifies not expired
    Returns the SecurityToken record if valid, otherwise None.
    """
    if not raw_token or not isinstance(raw_token, str):
        return None

    token_hashed = hash_token(raw_token.strip())
    try:
        token_obj = SecurityToken.objects.select_related('user').get(
            token_hash=token_hashed,
            token_type=token_type,
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
        return token_obj
    except SecurityToken.DoesNotExist:
        return None


@transaction.atomic
def consume_security_token(token_obj: SecurityToken) -> bool:
    """
    Atomically marks a SecurityToken as used to prevent replay attacks.
    Returns True if successfully consumed, False if already consumed or expired.
    """
    token_locked = SecurityToken.objects.select_for_update().filter(
        id=token_obj.id,
        used_at__isnull=True,
        expires_at__gt=timezone.now(),
    ).first()

    if not token_locked:
        return False

    token_locked.used_at = timezone.now()
    token_locked.save(update_fields=['used_at'])
    return True
