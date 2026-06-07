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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_organic', 'is_available', 'farmer']
    search_fields = ['name', 'description', 'farmer__username']
    ordering_fields = ['price', 'created_at', 'views']
    lookup_field = 'slug'

    def get_permissions(self):
        from accounts.permissions import IsFarmer, IsBuyer
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsFarmer(), IsFarmerOwnerOrReadOnly()]
        elif self.action in ['follow', 'unfollow', 'reserve', 'waitlist', 'reservations', 'followed']:
            return [permissions.IsAuthenticated(), IsBuyer()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return qs.filter(is_available=True)
            
        if user.is_staff:
            return qs
            
        from django.db.models import Q
        qs = qs.filter(Q(is_available=True) | Q(farmer=user))
        
        # Farmer specific location filtering
        if user.user_type == 'farmer':
            try:
                user_location = user.farmer_profile.location
                if user_location:
                    qs = qs.exclude(~Q(farmer=user) & Q(farmer__farmer_profile__location__iexact=user_location))
            except Exception:
                pass
                
        return qs

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Return top 8 products ordered by views."""
        products = self.get_queryset().order_by('-views')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def follow(self, request, slug=None):
        product = self.get_object()
        growth = product.active_crop_growth
        if not growth:
            return Response({'error': 'No active crop growth'}, status=status.HTTP_400_BAD_REQUEST)
        from crops.models import CropFollower
        follower, created = CropFollower.objects.get_or_create(buyer=request.user, crop_growth=growth)
        if not created:
            return Response({'message': 'Already following'}, status=status.HTTP_200_OK)
        return Response({'status': 'followed'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def unfollow(self, request, slug=None):
        product = self.get_object()
        growth = product.active_crop_growth
        if not growth:
            return Response({'error': 'No active crop growth'}, status=status.HTTP_400_BAD_REQUEST)
        from crops.models import CropFollower
        CropFollower.objects.filter(buyer=request.user, crop_growth=growth).delete()
        return Response({'status': 'unfollowed'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reserve(self, request, slug=None):
        product = self.get_object()
        growth = product.active_crop_growth
        if not growth:
            return Response({'error': 'No active crop growth'}, status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(request.user, 'is_farmer') and request.user.is_farmer and request.user == growth.farmer:
            return Response({'error': 'Farmers cannot reserve their own crops'}, status=status.HTTP_400_BAD_REQUEST)
            
        quantity_requested = float(request.data.get('quantity', 0))
        
        if quantity_requested <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            
        if quantity_requested > float(growth.available_quantity):
            return Response({'error': 'Requested quantity exceeds available quantity'}, status=status.HTTP_400_BAD_REQUEST)
            
        from crops.models import CropReservation
        reservation = CropReservation.objects.create(
            buyer=request.user,
            crop_growth=growth,
            quantity_reserved=quantity_requested,
            expected_delivery_date=request.data.get('expected_delivery_date', growth.expected_harvest_date)
        )
        
        growth.available_quantity = float(growth.available_quantity) - quantity_requested
        growth.save()
        
        from crops.serializers import CropReservationSerializer
        serializer = CropReservationSerializer(reservation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def waitlist(self, request, slug=None):
        product = self.get_object()
        growth = product.active_crop_growth
        if not growth:
            return Response({'error': 'No active crop growth'}, status=status.HTTP_400_BAD_REQUEST)
            
        quantity_requested = float(request.data.get('quantity', 0))
        if quantity_requested <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            
        from crops.models import Waitlist
        waitlist, created = Waitlist.objects.get_or_create(
            buyer=request.user,
            crop_growth=growth,
            defaults={'quantity': quantity_requested}
        )
        if not created:
            waitlist.quantity = quantity_requested
            waitlist.save()
            
        return Response({'status': 'waitlisted'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='upcoming-harvests', permission_classes=[permissions.AllowAny])
    def upcoming_harvests(self, request):
        qs = self.get_queryset()
        from crops.models import CropGrowth
        prebooking_growths = CropGrowth.objects.exclude(stage__in=['HARVESTED', 'NEAR_HARVEST']).values_list('product_id', flat=True)
        products = qs.filter(id__in=prebooking_growths)[:20]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reservations(self, request):
        from crops.models import CropReservation
        from crops.serializers import CropReservationSerializer
        qs = CropReservation.objects.filter(buyer=request.user)
        serializer = CropReservationSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def followed(self, request):
        from crops.models import CropFollower
        growth_ids = CropFollower.objects.filter(buyer=request.user).values_list('crop_growth_id', flat=True)
        products = self.get_queryset().filter(crop_growths__id__in=growth_ids).distinct()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        from accounts.permissions import IsFarmer
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsFarmer(), IsFarmerOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        return ProductImage.objects.filter(product__slug=self.kwargs.get('product_slug'))

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        serializer.save(product=product)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        from accounts.permissions import IsBuyer
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsBuyer(), IsBuyerOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        return Review.objects.filter(product__slug=self.kwargs.get('product_slug'))

    def perform_create(self, serializer):
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        if product.farmer == self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You cannot review your own product.")
        serializer.save(buyer=self.request.user, product=product)
