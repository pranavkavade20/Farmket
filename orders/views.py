from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Cart, CartItem, Order, OrderItem
from products.models import Product

@login_required
def add_to_cart_view(request, product_id):
    if not request.user.is_buyer:
        messages.error(request, 'Only buyers can add products to cart.')
        return redirect('products:list')
    
    product = get_object_or_404(Product, id=product_id, is_available=True)
    cart, created = Cart.objects.get_or_create(buyer=request.user)
    
    quantity = int(request.POST.get('quantity', 1))
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    messages.success(request, f'{product.name} added to cart!')
    return redirect('orders:cart')

@login_required
def cart_view(request):
    if not request.user.is_buyer:
        messages.error(request, 'Access denied.')
        return redirect('products:home')
    
    cart, created = Cart.objects.get_or_create(buyer=request.user)
    return render(request, 'orders/cart.html', {'cart': cart})

@login_required
def update_cart_view(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__buyer=request.user)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
        messages.success(request, 'Cart updated!')
    else:
        cart_item.delete()
        messages.success(request, 'Item removed from cart!')
    
    return redirect('orders:cart')

@login_required
def remove_from_cart_view(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__buyer=request.user)
    cart_item.delete()
    messages.success(request, 'Item removed from cart!')
    return redirect('orders:cart')

@login_required
def checkout_view(request):
    # Same as provided, but ensure OrderItem gets default 'pending' status
    if not request.user.is_buyer:
        return redirect('products:home')
    
    cart = get_object_or_404(Cart, buyer=request.user)
    if not cart.items.exists():
        return redirect('products:list')
    
    if request.method == 'POST':
        # ... (Same creation logic) ...
        order = Order.objects.create(
            buyer=request.user,
            total_amount=cart.total_price,
            delivery_address=request.POST.get('delivery_address'),
            payment_method=request.POST.get('payment_method'),
            notes=request.POST.get('notes', '')
        )
        
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                farmer=item.product.farmer,
                quantity=item.quantity,
                price=item.product.price,
                status='pending' # Explicitly pending
            )
            # Update stock
            item.product.stock_quantity -= item.quantity
            item.product.save()
        
        cart.items.all().delete()
        messages.success(request, 'Order placed successfully!')
        return redirect('orders:order_detail', order_id=order.id)
    
    return render(request, 'orders/checkout.html', {'cart': cart})

@login_required
def orders_view(request):
    """
    Dashboard logic:
    - Buyers see all their Orders.
    - Farmers see a list of Orders that contain THEIR items.
    """
    if request.user.is_buyer:
        orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
    elif request.user.is_farmer:
        # Find orders containing this farmer's products
        orders = Order.objects.filter(items__farmer=request.user).distinct().order_by('-created_at')
    else:
        orders = Order.objects.none()
    
    return render(request, 'orders/orders.html', {'orders': orders})

@login_required
def order_detail_view(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    # Security: Only Buyer or the specific Farmers involved can see this
    is_buyer = request.user == order.buyer
    is_involved_farmer = order.items.filter(farmer=request.user).exists()
    
    if not (is_buyer or is_involved_farmer):
        messages.error(request, 'You do not have permission to view this order.')
        return redirect('orders:orders')

    # CONTEXT SEPARATION
    # If it's a farmer, they should ONLY see their own items in the list
    if request.user.is_farmer:
        items = order.items.filter(farmer=request.user)
    else:
        items = order.items.all()

    return render(request, 'orders/order_detail.html', {
        'order': order, 
        'items': items,
        'user_is_buyer': is_buyer
    })

@login_required
def update_item_status(request, item_id):
    """
    API-like endpoint for Farmers to update the status of a specific item.
    Example: Pending -> Confirmed -> Shipped -> Delivered
    """
    item = get_object_or_404(OrderItem, id=item_id)
    
    # Security check: Only the farmer who owns the product can update status
    if request.user != item.farmer:
        messages.error(request, "Unauthorized action.")
        return redirect('orders:orders')
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(OrderItem.ITEM_STATUS_CHOICES):
            item.status = new_status
            item.save()
            
            # Recalculate main Order status
            item.order.update_status_based_on_items()
            
            messages.success(request, f"Item marked as {item.get_status_display()}")
        
    return redirect('orders:order_detail', order_id=item.order.id)