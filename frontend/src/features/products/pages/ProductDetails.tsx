import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { productService } from '@/features/products';
import type { Product, Review } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';
import { 
  Star, MapPin, Truck, ShieldCheck, Leaf, 
  Minus, Plus, ShoppingCart, ArrowLeft, Heart, Share2, AlertCircle, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
    await addToCart(product, quantity);
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
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-sm font-bold text-gray-400 mb-10">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-gray-900 dark:hover:text-white transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200">{product.category_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-[#F8F9FA] dark:bg-gray-900 relative flex items-center justify-center p-12">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 hover:scale-110" />
            {product.is_organic && (
              <div className="absolute top-8 left-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 shadow-xl tracking-widest uppercase">
                <Leaf className="h-4 w-4" /> ORGANIC
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative h-24 w-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all p-2 bg-[#F8F9FA] dark:bg-gray-900",
                    activeImage === idx ? "border-gray-900 dark:border-white shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:-translate-y-1"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.1]">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-3 py-1.5 rounded-full font-bold text-sm">
                <Star className="h-4 w-4 fill-current" />
                {avgRating} ({reviewsCount} reviews)
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-gray-900 dark:text-white" /> {product.farmer_name}
              </div>
            </div>

            <div className="flex items-end gap-3 mt-4">
              <span className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
              <span className="text-xl text-gray-400 font-bold mb-1.5">/ {product.unit}</span>
            </div>
            {!product.in_stock && (
              <div className="mt-4 inline-flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full text-sm font-bold">
                <AlertCircle className="h-5 w-5" /> Out of Stock
              </div>
            )}
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Description</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base md:text-lg font-medium max-w-2xl">
              {product.description || 'Freshly harvested produce delivered directly to your doorstep. Grown with care and sustainable farming practices to ensure the best quality and taste.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full h-16 p-2">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="h-12 w-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  disabled={!product.in_stock || quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-16 text-center font-black text-xl text-gray-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="h-12 w-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  disabled={!product.in_stock}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <Button 
                className="flex-1 h-16 text-lg gap-3 rounded-full font-black tracking-wide" 
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="h-6 w-6" /> ADD TO CART
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Button variant="outline" className="flex-1 h-14 w-full gap-2 rounded-full font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 border-gray-200">
                <Heart className="h-5 w-5" /> Save to Wishlist
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-14 w-full gap-2 rounded-full font-bold bg-[#F2FCE4] text-green-900 hover:bg-[#E6F8CE] dark:bg-green-900/30 dark:text-green-400"
                onClick={() => navigate('/messages')}
              >
                <MessageSquare className="h-5 w-5" /> Chat with Farmer
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-6 mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#EBF8FE] dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Fast Delivery</h4>
                <p className="text-sm text-gray-500 font-medium">Dispatched in 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#F2FCE4] dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Quality Promise</h4>
                <p className="text-sm text-gray-500 font-medium">100% fresh guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-20">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <div className="p-12 text-center bg-[#F8F9FA] dark:bg-[#111] rounded-[3rem]">
                 <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-gray-900 dark:text-white text-lg">{rev.buyer_name}</span>
                    <span className="text-sm font-bold text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-4 bg-gray-50 dark:bg-gray-900 w-fit px-3 py-1.5 rounded-full">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="h-fit sticky top-32 bg-[#F8F9FA] dark:bg-[#111] p-10 rounded-[3rem] shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star className={`h-8 w-8 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Share your experience..."
                    className="w-full rounded-[2rem] border border-transparent bg-white dark:bg-gray-900 px-6 py-5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all shadow-sm resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-full font-black text-base" isLoading={isSubmittingReview}>Submit Review</Button>
              </form>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold">You must be logged in to write a review.</p>
                <Link to="/login">
                  <Button variant="primary" className="h-14 px-8 rounded-full font-black">Log In to Review</Button>
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
