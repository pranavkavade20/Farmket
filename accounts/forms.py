from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User, FarmerProfile, BuyerProfile

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    user_type = forms.ChoiceField(choices=[('farmer', 'Farmer'), ('buyer', 'Buyer')])
    
    class Meta:
        model = User
        fields = ('username', 'email', 'user_type', 'phone_number', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            })

class FarmerProfileForm(forms.ModelForm):
    class Meta:
        model = FarmerProfile
        fields = ('farm_name', 'farm_size', 'location', 'organic_certified', 'description')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            })

class BuyerProfileForm(forms.ModelForm):
    class Meta:
        model = BuyerProfile
        fields = ('company_name', 'delivery_address', 'preferences')
        widgets = {
            'delivery_address': forms.Textarea(attrs={'rows': 3}),
            'preferences': forms.Textarea(attrs={'rows': 3}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            })

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'address', 'profile_picture')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            # Keep the same styling
            self.fields[field].widget.attrs.update({
                'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            })