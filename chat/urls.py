from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.conversations_view, name='conversations'),
    path('<int:conversation_id>/', views.conversation_detail_view, name='conversation_detail'),
    path('start/<int:user_id>/', views.start_conversation_view, name='start_conversation'),
    path('send/<int:conversation_id>/', views.send_message_view, name='send_message'),
    path('upload/<int:conversation_id>/', views.upload_media_view, name='upload_media'),
    path('delete/<int:message_id>/', views.delete_message_view, name='delete_message'),
    path('edit/<int:message_id>/', views.edit_message_view, name='edit_message'),
    path('react/<int:message_id>/', views.react_to_message_view, name='react_to_message'),
    path('remove-reaction/<int:message_id>/', views.remove_reaction_view, name='remove_reaction'),
    path('search/<int:conversation_id>/', views.search_messages_view, name='search_messages'),
    path('info/<int:conversation_id>/', views.get_conversation_info_view, name='conversation_info'),
    path('mark-read/<int:conversation_id>/', views.mark_as_read_view, name='mark_as_read'),
]