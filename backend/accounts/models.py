from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('admin', 'Admin'),
    )
    GENDER = (
        ("female","Female"),
        ("male","Male"),
        ("others","Others")
    )
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10,choices=GENDER)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    token_version = models.PositiveIntegerField(default=1, help_text="Incremented to invalidate all active sessions/tokens.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
    @property
    def is_farmer(self):
        return self.user_type == 'farmer'
    
    @property
    def is_buyer(self):
        return self.user_type == 'buyer'

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=200)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, help_text="Size in acres")
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    organic_certified = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_sales = models.IntegerField(default=0)
    
    def __str__(self):
        return self.farm_name

class BuyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    company_name = models.CharField(max_length=200, blank=True)
    delivery_address = models.TextField()
    preferences = models.TextField(blank=True, help_text="Preferred products or suppliers")
    
    def __str__(self):
        return f"{self.user.username}'s Buyer Profile"


class SecurityToken(models.Model):
    """
    Stores SHA-256 hashes of cryptographically secure single-use tokens for
    email verification, password reset, and email change requests.
    Plaintext tokens are NEVER stored in the database.
    """
    TOKEN_TYPE_CHOICES = (
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('email_change', 'Email Change'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_tokens')
    token_hash = models.CharField(max_length=64, db_index=True)
    token_type = models.CharField(max_length=32, choices=TOKEN_TYPE_CHOICES, db_index=True)
    new_email = models.EmailField(blank=True, null=True, help_text="Target email for email_change type")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token_hash', 'token_type']),
            models.Index(fields=['user', 'token_type', 'expires_at']),
        ]

    def __str__(self):
        return f"{self.token_type} for {self.user.email} (Used: {bool(self.used_at)})"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return self.used_at is None and not self.is_expired


class PasswordHistory(models.Model):
    """
    Keeps historical password hashes to prevent password reuse across the last N passwords.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Password history for {self.user.email} at {self.created_at}"