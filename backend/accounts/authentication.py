from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class VersionedJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to enforce token versioning.
    When a security event occurs (such as password change, password reset, or
    'Logout All Devices'), the user's `token_version` is incremented.
    Any existing access token carrying an older token_version is immediately rejected,
    achieving instant global session revocation without extra database lookups.
    """

    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        if not user.is_active:
            raise AuthenticationFailed('User account is inactive or disabled.', code='user_inactive')

        token_version = validated_token.get('token_version')
        if token_version is not None and token_version != user.token_version:
            raise AuthenticationFailed(
                'Token has been invalidated by a security event. Please log in again.',
                code='token_invalidated',
            )

        return user


class VersionedJWTOpenApiExtension(OpenApiAuthenticationExtension):
    """
    Registers VersionedJWTAuthentication in drf-spectacular for Swagger/OpenAPI documentation.
    """
    target_class = 'accounts.authentication.VersionedJWTAuthentication'
    name = 'jwtAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }
