from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import FarmerProfile, BuyerProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation returned on login/profile."""
    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'gender', 'user_type', 'phone_number', 'address',
            'profile_picture', 'is_verified', 'created_at',
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
        # Auto-create profile based on user type
        if user.user_type == 'farmer':
            FarmerProfile.objects.get_or_create(
                user=user,
                defaults={'farm_name': f"{user.first_name}'s Farm", 'farm_size': 1, 'location': ''},
            )
        elif user.user_type == 'buyer':
            BuyerProfile.objects.get_or_create(user=user, defaults={'delivery_address': ''})
        return user


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
