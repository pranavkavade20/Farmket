from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import CropGrowth, CropReservation, CropFollower
from .serializers import CropGrowthSerializer, CropReservationSerializer, CropFollowerSerializer
from products.permissions import IsFarmerOwnerOrReadOnly, IsBuyerOwnerOrReadOnly

class CropGrowthViewSet(viewsets.ModelViewSet):
    queryset = CropGrowth.objects.all()
    serializer_class = CropGrowthSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsFarmerOwnerOrReadOnly]

    def get_queryset(self):
        qs = CropGrowth.objects.select_related('farmer', 'product').prefetch_related('stage_history', 'reservations')
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return qs.exclude(crop_stage__in=['HARVESTED', 'SOLD_OUT'])
            
        if user.is_staff:
            return qs
            
        if hasattr(user, 'is_farmer') and user.is_farmer:
            # Farmer sees their own crops
            return qs.filter(farmer=user)
            
        # Buyers see available upcoming harvests
        return qs.exclude(crop_stage__in=['HARVESTED', 'SOLD_OUT'])

    def perform_create(self, serializer):
        # Automatically set available_quantity equal to expected_quantity on creation
        expected = serializer.validated_data.get('expected_quantity')
        serializer.save(farmer=self.request.user, available_quantity=expected)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def upcoming(self, request):
        qs = CropGrowth.objects.exclude(crop_stage__in=['HARVESTED', 'SOLD_OUT']).order_by('expected_harvest_date')[:20]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsFarmerOwnerOrReadOnly])
    def update_stage(self, request, pk=None):
        crop = self.get_object()
        new_stage = request.data.get('stage')
        remarks = request.data.get('remarks', '')
        
        if not new_stage or new_stage not in dict(CropGrowth.STAGE_CHOICES):
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)
            
        # The history creation and notification will be handled by signals
        crop.crop_stage = new_stage
        
        if new_stage == 'HARVESTED' and not crop.actual_harvest_date:
            crop.actual_harvest_date = timezone.now().date()
            
            if crop.product:
                crop.product.stock_quantity += int(float(crop.available_quantity))
                crop.product.save()
                
            from orders.models import OrderItem
            reservations = crop.reservations.filter(reservation_status__in=['PENDING', 'CONFIRMED'])
            for res in reservations:
                order_items = OrderItem.objects.filter(
                    order__buyer=res.buyer,
                    crop_growth=crop,
                    is_prebooking=True
                )
                for item in order_items:
                    item.status = 'pending' # Converts to standard pending order item
                    item.is_prebooking = False # Now it's a standard order item
                    item.save()
                res.reservation_status = 'COMPLETED'
                res.save()

            
        # Attach remarks so the signal can use it
        crop._stage_remarks = remarks
        crop._updated_by = request.user
        crop.save()
        
        return Response({'status': 'Stage updated', 'current_stage': crop.crop_stage})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reserve(self, request, pk=None):
        if hasattr(request.user, 'is_farmer') and request.user.is_farmer and request.user == self.get_object().farmer:
            return Response({'error': 'Farmers cannot reserve their own crops'}, status=status.HTTP_400_BAD_REQUEST)
            
        crop = self.get_object()
        quantity_requested = float(request.data.get('quantity', 0))
        
        if quantity_requested <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            
        if quantity_requested > crop.available_quantity:
            return Response({'error': 'Requested quantity exceeds available quantity'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create reservation
        reservation = CropReservation.objects.create(
            buyer=request.user,
            crop_growth=crop,
            quantity_reserved=quantity_requested,
            expected_delivery_date=request.data.get('expected_delivery_date', crop.expected_harvest_date)
        )
        
        # Deduct from available quantity
        crop.available_quantity = float(crop.available_quantity) - quantity_requested
        crop.save()
        
        serializer = CropReservationSerializer(reservation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        crop = self.get_object()
        follower, created = CropFollower.objects.get_or_create(buyer=request.user, crop_growth=crop)
        if not created:
            return Response({'message': 'Already following'}, status=status.HTTP_200_OK)
        return Response({'status': 'followed'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unfollow(self, request, pk=None):
        crop = self.get_object()
        CropFollower.objects.filter(buyer=request.user, crop_growth=crop).delete()
        return Response({'status': 'unfollowed'}, status=status.HTTP_200_OK)

class CropReservationViewSet(viewsets.ModelViewSet):
    serializer_class = CropReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'is_farmer') and user.is_farmer:
            return CropReservation.objects.filter(crop_growth__farmer=user)
        return CropReservation.objects.filter(buyer=user)
        
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reservation = self.get_object()
        if request.user != reservation.crop_growth.farmer:
            return Response({'error': 'Only the farmer can approve'}, status=status.HTTP_403_FORBIDDEN)
            
        reservation.reservation_status = 'CONFIRMED'
        reservation.save()
        return Response({'status': 'approved'})
        
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reservation = self.get_object()
        if request.user != reservation.crop_growth.farmer:
            return Response({'error': 'Only the farmer can reject'}, status=status.HTTP_403_FORBIDDEN)
            
        reservation.reservation_status = 'CANCELLED'
        reservation.save()
        
        # Restore quantity
        crop = reservation.crop_growth
        crop.available_quantity = float(crop.available_quantity) + float(reservation.quantity_reserved)
        crop.save()
        
        return Response({'status': 'rejected'})
