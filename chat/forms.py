from django import forms
from .models import Message

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'image', 'video', 'audio', 'document']
        widgets = {
            'content': forms.Textarea(attrs={
                'rows': 1,
                'placeholder': 'Type a message...',
                'class': 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none'
            }),
            'message_type': forms.Select(attrs={'class': 'hidden'}),
        }

class MediaUploadForm(forms.Form):
    media_type = forms.ChoiceField(choices=Message.MESSAGE_TYPE_CHOICES)
    file = forms.FileField()
    caption = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2}))