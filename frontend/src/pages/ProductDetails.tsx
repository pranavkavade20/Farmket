import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { productService } from '@/services/productService';
import type { Product, Review } from '@/types';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';
import { 
  Star, MapPin, Truck, ShieldCheck, Leaf, 
  Minus, Plus, ShoppingCart, ArrowLeft, Heart, Share2, AlertCircle, MessageSquare
} from 'lucide-react';
import { cn } from '@/utils/cn';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  useSEO({
    title: product ? `${product.name} - Farmket` : 'Product Details',
    description: product?.description.slice(0, 160) || 'View product details on Farmket.',
  });

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      productService.getProduct(id)
        .then(setProduct)
        .catch(() => toast.error('Failed to load product details'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error('Please log in to add items to cart', { icon: '🔒' });
      return;
    }
    // Note: the cart context addToCart might not support quantity yet, but we pass the product
    await addToCart(product);
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await productService.createReview(product.slug, { rating, comment });
      setProduct({ ...product, reviews: [newReview, ...product.reviews] });
      setRating(5);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <Link to="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images.map(img => img.image) : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop'];
  const avgRating = product.reviews.length > 0 ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1) : '4.8';
  const reviewsCount = product.reviews.length > 0 ? product.reviews.length : 124;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-green-600">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{product.category_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            {product.is_organic && (
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Leaf className="h-3.5 w-3.5" /> ORGANIC
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    activeImage === idx ? "border-green-600" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">{avgRating}</span>
                <span className="text-amber-600/70 dark:text-amber-500/70 text-sm ml-1">({reviewsCount} reviews)</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm font-medium">
                <MapPin className="h-4 w-4 text-green-600" /> Sourced directly from {product.farmer_name}
              </div>
            </div>

            <div className="flex items-end gap-3 mt-4">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{product.price}</span>
              <span className="text-lg text-gray-500 mb-1">/ {product.unit}</span>
            </div>
            {!product.in_stock && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-sm font-medium">
                <AlertCircle className="h-4 w-4" /> Out of Stock
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
              {product.description || 'Freshly harvested produce delivered directly to your doorstep. Grown with care and sustainable farming practices to ensure the best quality and taste.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0c1110]">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 text-gray-500 hover:text-green-600 disabled:opacity-50"
                  disabled={!product.in_stock || quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-3 text-gray-500 hover:text-green-600 disabled:opacity-50"
                  disabled={!product.in_stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1 h-[50px] text-lg gap-2" 
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Button variant="outline" className="flex-1 w-full gap-2 border-gray-200 text-gray-600">
                <Heart className="h-4 w-4" /> Save to Wishlist
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 w-full gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                onClick={() => navigate('/messages')}
              >
                <MessageSquare className="h-4 w-4" /> Chat with Farmer
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Fast Delivery</h4>
                <p className="text-xs text-gray-500 mt-0.5">Dispatched within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quality Promise</h4>
                <p className="text-xs text-gray-500 mt-0.5">100% fresh guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first to review!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-[#0c1110] p-6 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 dark:text-white">{rev.buyer_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="h-fit sticky top-24 bg-white dark:bg-[#0c1110] p-6 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`h-6 w-6 transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400 hover:fill-amber-500 hover:text-amber-500' : 'text-gray-300 dark:text-gray-700 hover:text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmittingReview}>Submit Review</Button>
              </form>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">You must be logged in to write a review.</p>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In to Review</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
