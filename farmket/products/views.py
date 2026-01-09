from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Avg
from django.core.paginator import Paginator
from .models import Product, Category
from .forms import ProductForm, ProductImageFormSet, ReviewForm

def home_view(request):
    featured_products = Product.objects.filter(is_available=True).order_by('-created_at')[:8]
    categories = Category.objects.filter(is_active=True)
    
    context = {
        'featured_products': featured_products,
        'categories': categories,
    }
    return render(request, 'products/home.html', context)

def about(request):
    return render(request,'about.html',)

def contact(request):
    return render(request,'contact.html',)

def faq(request):
    return render(request,'faq.html',)

def product_list_view(request):
    products = Product.objects.filter(is_available=True)
    
    # Search
    search_query = request.GET.get('q', '')
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | 
            Q(description__icontains=search_query)
        )
    
    # Category filter
    category_slug = request.GET.get('category')
    if category_slug:
        products = products.filter(category__slug=category_slug)
    
    # Organic filter
    if request.GET.get('organic') == 'true':
        products = products.filter(is_organic=True)
    
    # Sorting
    sort_by = request.GET.get('sort', '-created_at')
    products = products.order_by(sort_by)
    
    # Pagination
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    products_page = paginator.get_page(page_number)
    
    categories = Category.objects.filter(is_active=True)
    
    context = {
        'products': products_page,
        'categories': categories,
        'search_query': search_query,
    }
    return render(request, 'products/product_list.html', context)

def product_detail_view(request, slug):
    product = get_object_or_404(Product, slug=slug)
    product.views += 1
    product.save(update_fields=['views'])
    
    reviews = product.reviews.all()
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    
    if request.method == 'POST' and request.user.is_authenticated and request.user.is_buyer:
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.product = product
            review.buyer = request.user
            review.save()
            messages.success(request, 'Review submitted successfully!')
            return redirect('products:detail', slug=slug)
    else:
        form = ReviewForm()
    
    context = {
        'product': product,
        'reviews': reviews,
        'avg_rating': avg_rating,
        'form': form,
    }
    return render(request, 'products/product_detail.html', context)

@login_required
def add_product_view(request):
    if not request.user.is_farmer:
        messages.error(request, 'Only farmers can add products.')
        return redirect('products:home')
    
    if request.method == 'POST':
        form = ProductForm(request.POST)
        formset = ProductImageFormSet(request.POST, request.FILES)
        
        if form.is_valid() and formset.is_valid():
            product = form.save(commit=False)
            product.farmer = request.user
            product.save()
            
            formset.instance = product
            formset.save()
            
            messages.success(request, 'Product added successfully!')
            return redirect('products:my_products')
    else:
        form = ProductForm()
        formset = ProductImageFormSet()
    
    context = {
        'form': form,
        'formset': formset,
    }
    return render(request, 'products/add_product.html', context)

@login_required
def my_products_view(request):
    if not request.user.is_farmer:
        messages.error(request, 'Access denied.')
        return redirect('products:home')
    
    products = Product.objects.filter(farmer=request.user)
    return render(request, 'products/my_products.html', {'products': products})

@login_required
def edit_product_view(request, slug):
    product = get_object_or_404(Product, slug=slug, farmer=request.user)
    
    if request.method == 'POST':
        form = ProductForm(request.POST, instance=product)
        formset = ProductImageFormSet(request.POST, request.FILES, instance=product)
        
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()
            messages.success(request, 'Product updated successfully!')
            return redirect('products:my_products')
    else:
        form = ProductForm(instance=product)
        formset = ProductImageFormSet(instance=product)
    
    context = {
        'form': form,
        'formset': formset,
        'product': product,
    }
    return render(request, 'products/edit_product.html', context)

@login_required
def delete_product_view(request, slug):
    product = get_object_or_404(Product, slug=slug, farmer=request.user)
    
    if request.method == 'POST':
        product.delete()
        messages.success(request, 'Product deleted successfully!')
        return redirect('products:my_products')
    
    return render(request, 'products/delete_product.html', {'product': product})