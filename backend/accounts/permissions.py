from rest_framework import permissions

class IsFarmer(permissions.BasePermission):
    """
    Allows access only to authenticated users with user_type == 'farmer'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == 'farmer')

class IsBuyer(permissions.BasePermission):
    """
    Allows access only to authenticated users with user_type == 'buyer'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == 'buyer')
