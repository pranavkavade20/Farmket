from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.cache import never_cache
from .forms import UserRegistrationForm, FarmerProfileForm, BuyerProfileForm,UserUpdateForm
from .models import User, FarmerProfile, BuyerProfile

@csrf_protect
@never_cache
def register_view(request):
    if request.user.is_authenticated:
        return redirect('products:home')
    
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Create profile based on user type
            if user.user_type == 'farmer':
                FarmerProfile.objects.create(user=user, farm_name=f"{user.username}'s Farm", location="", farm_size=0)
            else:
                BuyerProfile.objects.create(user=user, delivery_address="")
            
            messages.success(request, 'Registration successful! Please complete your profile.')
            login(request, user)
            return redirect('accounts:complete_profile')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

@csrf_protect
@never_cache
def login_view(request):
    if request.user.is_authenticated:
        return redirect('products:home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'products:home')
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'accounts/login.html')

@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('accounts:login')

@login_required
def complete_profile_view(request):
    user = request.user
    
    # Determine which profile form to use    
    if user.is_farmer:
        profile = user.farmer_profile
        ProfileFormClass = FarmerProfileForm
    
    if user.is_staff:
        profile = user
        ProfileFormClass = UserUpdateForm
    else:
        profile = user.buyer_profile
        ProfileFormClass = BuyerProfileForm
    
    if request.method == 'POST':
        # Pass request.FILES to handle image uploads
        user_form = UserUpdateForm(request.POST, request.FILES, instance=user)
        profile_form = ProfileFormClass(request.POST, instance=profile)
        
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('accounts:profile') # Redirect to profile page to see changes
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        user_form = UserUpdateForm(instance=user)
        profile_form = ProfileFormClass(instance=profile)
    
    context = {
        'user_form': user_form,
        'profile_form': profile_form
    }
    
    return render(request, 'accounts/complete_profile.html', context)

@login_required
def profile_view(request):
    return render(request, 'accounts/profile.html')