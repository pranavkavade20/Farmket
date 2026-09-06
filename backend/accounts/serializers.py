from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from .models import FarmerProfile, BuyerProfile
from .services import record_password_history, check_password_reuse

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation returned on login/profile."""
    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'gender', 'user_type', 'phone_number', 'address',
            'profile_picture', 'is_verified', 'created_at', 'is_online'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_profile_picture(self, obj):
        """Return an absolute URL so the React frontend (different port) can load it."""
        if not obj.profile_picture:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_picture.url)
        # Fallback: return relative URL if no request in context
        return obj.profile_picture.url

    def get_is_online(self, obj):
        return cache.get(f"user_online_{obj.id}", False)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom SimpleJWT serializer:
    - Injects token_version, user_type, and email claims into both tokens
    - Returns access, refresh, token, refresh_token (for client backward-compat)
    - Returns serialized user profile directly in the login response
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['token_version'] = user.token_version
        token['user_type'] = user.user_type
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Embed version in access token payload explicitly
        refresh = self.get_token(self.user)
        access = refresh.access_token

        data['refresh'] = str(refresh)
        data['access'] = str(access)
        # Compatibility aliases for existing frontend/mobile clients
        data['token'] = str(access)
        data['refresh_token'] = str(refresh)
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Used for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'confirm_password', 'user_type', 'phone_number', 'gender',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # Record initial password in history
        record_password_history(user, password)
        # Auto-create profile based on user type
        if user.user_type == 'farmer':
            FarmerProfile.objects.get_or_create(
                user=user,
                defaults={'farm_name': f"{user.first_name}'s Farm", 'farm_size': 1, 'location': ''},
            )
        elif user.user_type == 'buyer':
            BuyerProfile.objects.get_or_create(user=user, defaults={'delivery_address': ''})
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Used by authenticated users to update their password."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'New passwords do not match.'})

        user = self.context['request'].user
        if check_password_reuse(user, attrs['new_password']):
            raise serializers.ValidationError({
                'new_password': 'You cannot reuse your current password or any of your last 5 passwords.'
            })
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Used to initiate password reset via email."""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Used to confirm password reset using single-use security token."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Used to verify email address using single-use token."""
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """Used to request a fresh email verification link."""
    email = serializers.EmailField(required=True)


class ChangeEmailSerializer(serializers.Serializer):
    """Used by authenticated user to request changing email address."""
    new_email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_email(self, value):
        user = self.context['request'].user
        if value.lower() == user.email.lower():
            raise serializers.ValidationError('New email must be different from your current email.')
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return value.lower()


class VerifyEmailChangeSerializer(serializers.Serializer):
    """Used to confirm email change via token sent to the new email."""
    token = serializers.CharField(required=True)


class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FarmerProfile
        fields = '__all__'


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BuyerProfile
        fields = '__all__'


class UserUpdateSerializer(serializers.ModelSerializer):
    """For updating profile details (excludes auth fields)."""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'address', 'profile_picture', 'gender']

