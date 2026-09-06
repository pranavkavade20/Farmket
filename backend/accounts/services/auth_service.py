from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.db import transaction
from accounts.models import PasswordHistory

MAX_PASSWORD_HISTORY = 5


def record_password_history(user, raw_password: str) -> None:
    """
    Saves the new password hash into PasswordHistory and trims history to the last 5 entries.
    """
    PasswordHistory.objects.create(
        user=user,
        password_hash=make_password(raw_password),
    )
    # Trim to MAX_PASSWORD_HISTORY
    history_ids = list(
        PasswordHistory.objects.filter(user=user)
        .order_by('-created_at')
        .values_list('id', flat=True)[:MAX_PASSWORD_HISTORY]
    )
    if history_ids:
        PasswordHistory.objects.filter(user=user).exclude(id__in=history_ids).delete()


def check_password_reuse(user, raw_password: str, limit: int = MAX_PASSWORD_HISTORY) -> bool:
    """
    Returns True if raw_password matches user's current password or any of their last `limit` passwords.
    """
    if user.check_password(raw_password):
        return True

    recent_passwords = PasswordHistory.objects.filter(user=user).order_by('-created_at')[:limit]
    for history in recent_passwords:
        if check_password(raw_password, history.password_hash):
            return True

    return False


@transaction.atomic
def invalidate_user_sessions(user, keep_token_str: str = None) -> int:
    """
    Invalidates all active sessions for a user:
    1. Increments user.token_version so any outstanding access token is immediately rejected by VersionedJWTAuthentication.
    2. Blacklists all outstanding refresh tokens for the user in SimpleJWT blacklist.
    Returns the number of blacklisted tokens.
    """
    user.token_version += 1
    user.save(update_fields=['token_version'])

    # Blacklist outstanding refresh tokens
    outstanding_tokens = OutstandingToken.objects.filter(user=user)
    if keep_token_str:
        outstanding_tokens = outstanding_tokens.exclude(token=keep_token_str)

    blacklisted_count = 0
    for token in outstanding_tokens:
        _, created = BlacklistedToken.objects.get_or_create(token=token)
        if created:
            blacklisted_count += 1

    return blacklisted_count


def get_tokens_for_user(user) -> dict[str, str]:
    """
    Generates a SimpleJWT access + refresh token pair embedded with
    token_version, user_type, and email claims.
    """
    refresh = RefreshToken.for_user(user)
    refresh['token_version'] = user.token_version
    refresh['user_type'] = user.user_type
    refresh['email'] = user.email

    access = refresh.access_token
    access['token_version'] = user.token_version
    access['user_type'] = user.user_type
    access['email'] = user.email

    return {
        'refresh': str(refresh),
        'access': str(access),
    }
