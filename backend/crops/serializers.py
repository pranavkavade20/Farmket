from rest_framework import serializers
from .models import CropGrowth, CropStageHistory, CropReservation, CropFollower
from products.serializers import ProductSerializer

class CropStageHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.ReadOnlyField(source='updated_by.username')

    class Meta:
        model = CropStageHistory
        fields = ['id', 'previous_stage', 'current_stage', 'updated_by', 'updated_by_name', 'remarks', 'timestamp']
        read_only_fields = ['timestamp']

class CropReservationSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source='buyer.username')
    crop_name = serializers.ReadOnlyField(source='crop_growth.product.name')

    class Meta:
        model = CropReservation
        fields = ['id', 'buyer', 'buyer_name', 'crop_growth', 'crop_name', 'quantity_reserved', 'reservation_status', 'reserved_at', 'expected_delivery_date']
        read_only_fields = ['buyer', 'reserved_at']

class CropFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropFollower
        fields = ['id', 'buyer', 'crop_growth', 'followed_at']
        read_only_fields = ['buyer', 'followed_at']

class CropGrowthSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source='farmer.username')
    product_details = ProductSerializer(source='product', read_only=True)
    stage_history = CropStageHistorySerializer(many=True, read_only=True)
    reservations = CropReservationSerializer(many=True, read_only=True)
    followers_count = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()

    class Meta:
        model = CropGrowth
        fields = [
            'id', 'farmer', 'farmer_name', 'product', 'product_details',
            'sowing_date', 'expected_harvest_date', 'actual_harvest_date',
            'expected_quantity', 'available_quantity', 'crop_stage',
            'progress_percentage', 'organic', 'notes', 'created_at', 'updated_at',
            'stage_history', 'reservations', 'followers_count', 'is_followed'
        ]
        read_only_fields = ['farmer', 'available_quantity', 'created_at', 'updated_at']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(buyer=request.user).exists()
        return False

    def validate(self, data):
        if data.get('sowing_date') and data.get('expected_harvest_date'):
            if data['expected_harvest_date'] <= data['sowing_date']:
                raise serializers.ValidationError("Expected harvest date must be after sowing date.")
        return data
