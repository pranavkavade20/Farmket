from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage, Review, CropTracking, BuyerCropInterest
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer, ReviewSerializer, CropTrackingSerializer, BuyerCropInterestSerializer
from .permissions import IsFarmerOwnerOrReadOnly, IsBuyerOwnerOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('farmer', 'category').prefetch_related('images', 'reviews')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsFarmerOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_organic', 'is_available']
    search_fields = ['name', 'description', 'farmer__username']
    ordering_fields = ['price', 'created_at', 'views']
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return qs.filter(is_available=True)
            
        if user.is_staff:
            return qs
            
        from django.db.models import Q
        return qs.filter(Q(is_available=True) | Q(farmer=user))

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Return top 8 products ordered by views."""
        products = self.get_queryset().order_by('-views')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmerOwnerOrReadOnly]

    def get_queryset(self):
        return ProductImage.objects.filter(product__slug=self.kwargs.get('product_slug'))

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        serializer.save(product=product)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsBuyerOwnerOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(product__slug=self.kwargs.get('product_slug'))

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        serializer.save(buyer=self.request.user, product=product)

class CropTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = CropTrackingSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmerOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CropTracking.objects.all()
        elif user.is_farmer:
            return CropTracking.objects.filter(product__farmer=user)
        else:
            return CropTracking.objects.filter(product__slug=self.kwargs.get('product_slug', ''))

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        serializer.save(product=product)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsFarmerOwnerOrReadOnly])
    def update_stage(self, request, pk=None, product_slug=None):
        crop = self.get_object()
        new_stage = request.data.get('stage')
        if new_stage in dict(CropTracking.STATUS_CHOICES):
            crop.current_stage = new_stage
            crop.notes = request.data.get('notes', crop.notes)
            crop.save()
            return Response({'status': 'stage updated', 'current_stage': crop.current_stage})
        return Response({'error': 'invalid stage'}, status=status.HTTP_400_BAD_REQUEST)

class BuyerCropInterestViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerCropInterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return BuyerCropInterest.objects.all()
        elif user.is_buyer:
            return BuyerCropInterest.objects.filter(buyer=user)
        return BuyerCropInterest.objects.none()

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        if BuyerCropInterest.objects.filter(product=product, buyer=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You are already subscribed to this crop.")
        serializer.save(buyer=self.request.user, product=product)