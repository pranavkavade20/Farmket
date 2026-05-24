from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            try:
                # This will decode the token and check its validity
                access_token = AccessToken(token)
                user_id = access_token.payload.get('user_id')
                user = await get_user(user_id)
                if user.is_authenticated:
                    scope["user"] = user
                else:
                    print(f"JWT Auth: User {user_id} not found")
            except Exception as e:
                print(f"JWT Auth Error: {str(e)}")
                scope["user"] = AnonymousUser()
        else:
            # Only set to Anonymous if not already authenticated by session
            if "user" not in scope or not scope["user"].is_authenticated:
                scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
