from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Limits authentication attempts (login, register) to prevent credential stuffing.
    Default scope: 'auth'
    """
    scope = 'auth'


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Limits password reset requests per IP to prevent email spam / enumeration attacks.
    Default scope: 'password_reset'
    """
    scope = 'password_reset'


class EmailVerificationRateThrottle(AnonRateThrottle):
    """
    Limits resend verification requests to prevent mailbox flooding.
    Default scope: 'email_verification'
    """
    scope = 'email_verification'


class UserSecurityActionThrottle(UserRateThrottle):
    """
    Limits sensitive authenticated security actions like password changes or email change requests.
    Default scope: 'user_security'
    """
    scope = 'user_security'
