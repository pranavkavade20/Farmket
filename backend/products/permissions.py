from rest_framework import permissions

class IsFarmerOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the farmer who created the product to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the farmer of the product.
        # Handle cases where the object might be a Product, ProductImage, or Review.
        if hasattr(obj, 'farmer'):
            return obj.farmer == request.user
        elif hasattr(obj, 'product') and hasattr(obj.product, 'farmer'):
            return obj.product.farmer == request.user
            
        return False

class IsBuyerOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the buyer who created the review to edit it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'buyer'):
            return obj.buyer == request.user
            
        return False
