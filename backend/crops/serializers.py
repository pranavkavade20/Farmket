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
    buyer_email = serializers.ReadOnlyField(source='buyer.email')
    buyer_phone = serializers.ReadOnlyField(source='buyer.phone_number')
    crop_name = serializers.SerializerMethodField()
    farmer_name = serializers.ReadOnlyField(source='crop_growth.farmer.username')
    farmer_id = serializers.ReadOnlyField(source='crop_growth.farmer.id')
    farmer_phone = serializers.ReadOnlyField(source='crop_growth.farmer.phone_number')
    unit = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    crop_stage = serializers.ReadOnlyField(source='crop_growth.stage')
    expected_harvest_date = serializers.ReadOnlyField(source='crop_growth.expected_harvest_date')
    product_slug = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = CropReservation
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_email', 'buyer_phone',
            'crop_growth', 'crop_name', 'farmer_name', 'farmer_id', 'farmer_phone',
            'unit', 'price', 'crop_stage', 'expected_harvest_date', 'product_slug',
            'image', 'quantity_reserved', 'reservation_status', 'reserved_at',
            'expected_delivery_date'
        ]
        read_only_fields = ['buyer', 'reserved_at']

    def get_crop_name(self, obj):
        if obj.crop_growth and obj.crop_growth.product:
            return obj.crop_growth.product.name
        return "Unknown Crop"

    def get_unit(self, obj):
        if obj.crop_growth and obj.crop_growth.product:
            return obj.crop_growth.product.unit
        return "kg"

    def get_price(self, obj):
        if obj.crop_growth and obj.crop_growth.product:
            return str(obj.crop_growth.product.price)
        return "0.00"

    def get_product_slug(self, obj):
        if obj.crop_growth and obj.crop_growth.product:
            return obj.crop_growth.product.slug
        return None

    def get_image(self, obj):
        if obj.crop_growth and obj.crop_growth.product:
            first_img = obj.crop_growth.product.images.first()
            if first_img and first_img.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first_img.image.url)
                return first_img.image.url
        return None

class CropFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropFollower
        fields = ['id', 'buyer', 'crop_growth', 'followed_at']
        read_only_fields = ['buyer', 'followed_at']

class CropGrowthSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source='farmer.username')
    crop_name = serializers.ReadOnlyField(source='product.name')
    product_details = ProductSerializer(source='product', read_only=True)
    stage_history = CropStageHistorySerializer(many=True, read_only=True)
    reservations = CropReservationSerializer(many=True, read_only=True)
    followers_count = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()
    progress = serializers.ReadOnlyField(source='progress_percentage')

    class Meta:
        model = CropGrowth
        fields = [
            'id', 'farmer', 'farmer_name', 'crop_name', 'product', 'product_details',
            'sowing_date', 'expected_harvest_date', 'actual_harvest_date',
            'expected_quantity', 'available_quantity', 'stage',
            'progress', 'organic', 'notes', 'created_at', 'last_updated',
            'stage_history', 'reservations', 'followers_count', 'is_followed'
        ]
        read_only_fields = ['farmer', 'available_quantity', 'created_at', 'last_updated']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(buyer=request.user).exists()
        return False

    def validate(self, data):
        request = self.context.get('request')
        product = data.get('product')
        
        if product and request and product.farmer != request.user:
            raise serializers.ValidationError({"product": "You can only track your own products."})
            
        if product and not self.instance: # on create
            active_growths = CropGrowth.objects.filter(
                product=product
            ).exclude(stage='HARVESTED')
            if active_growths.exists():
                raise serializers.ValidationError({"product": "This product already has an active tracking cycle."})

        if data.get('sowing_date') and data.get('expected_harvest_date'):
            if data['expected_harvest_date'] <= data['sowing_date']:
                raise serializers.ValidationError("Expected harvest date must be after sowing date.")
        return data
