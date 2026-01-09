from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Change 'ChatConsumer' to 'EnhancedChatConsumer'
    re_path(r'ws/chat/(?P<conversation_id>\w+)/$', consumers.EnhancedChatConsumer.as_asgi()),
]