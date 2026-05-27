from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage, Review
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer, ReviewSerializer
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