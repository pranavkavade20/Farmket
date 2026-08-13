import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button, ProductCardSkeleton, Container } from '@/components/ui';
import { ProductCard } from '@/features/products';
import type { Product } from '@/types';
import { MapPin, Star, ShieldCheck, Leaf, Tractor, Phone, Mail, Award, MessageSquare } from 'lucide-react';
import { productService } from '@/features/products';
import { toast } from 'sonner';

// Mock data for farmer profile since we might not have a full API for this yet
const mockFarmer = {
  id: 1,
  name: "Rajesh Kumar",
  farmName: "Green Valley Organics",
  location: "Pune, Maharashtra",
  verified: true,
  rating: 4.8,
  reviewsCount: 156,
  joinedDate: "Mar 2023",
  about: "We are a third-generation farming family dedicated to sustainable and organic agricultural practices. Our 50-acre farm specializes in seasonal vegetables, premium quality wheat, and organic pulses. We believe in delivering farm-fresh goodness directly to your table.",
  banner: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop",
  avatar: "https://i.pravatar.cc/300?img=11",
  stats: {
    productsSold: "5000+",
    acres: 50,
    farmingType: "Organic",
  }
};

const FarmerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSEO({
    title: `${mockFarmer.name} - Farmket`,
    description: `View products and farm details from ${mockFarmer.farmName}.`,
  });

  useEffect(() => {
    // Fetch products belonging to this farmer
    // Mocking the API call for farmer specific products for now by just getting generic products
    productService.getProducts({})
      .then((res) => {
        setProducts(res.results.slice(0, 4));
      })
      .catch(() => {
        toast.error('Failed to load farmer products');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Banner */}
      <div className="w-full h-[250px] sm:h-[350px] relative overflow-hidden">
        <img src={mockFarmer.banner} alt="Farm Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <Container className="-mt-20 relative z-10">
        
        {/* Profile Header Card */}
        <div className="bg-surface rounded-3xl p-6 sm:p-10 shadow-lg border border-border-subtle mb-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          <div className="relative shrink-0">
            <img src={mockFarmer.avatar} alt={mockFarmer.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-surface shadow-md object-cover" />
            {mockFarmer.verified && (
              <div className="absolute bottom-2 right-2 bg-brand text-white p-2 rounded-full shadow-lg" title="Verified Farmer">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-1 tracking-tight">
                  {mockFarmer.farmName}
                </h1>
                <p className="text-lg font-medium text-foreground-secondary flex items-center gap-2">
                  <span className="text-foreground font-semibold">{mockFarmer.name}</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full font-bold h-12 px-6">
                  Follow Farm
                </Button>
                <Button variant="primary" className="rounded-full font-bold h-12 px-6 gap-2">
                  <MessageSquare className="w-5 h-5" /> Message
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <div className="flex items-center gap-1.5 bg-surface-elevated px-4 py-2 rounded-full border border-border-subtle">
                <MapPin className="w-4 h-4 text-brand" /> {mockFarmer.location}
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-900/50">
                <Star className="w-4 h-4 fill-current" /> {mockFarmer.rating} ({mockFarmer.reviewsCount} Reviews)
              </div>
              <div className="flex items-center gap-1.5 bg-surface-elevated px-4 py-2 rounded-full border border-border-subtle text-foreground-secondary">
                <Award className="w-4 h-4" /> Joined {mockFarmer.joinedDate}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: About & Stats */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border-subtle">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">About the Farm</h2>
              <p className="text-foreground-secondary font-medium leading-relaxed">
                {mockFarmer.about}
              </p>
              
              <div className="mt-8 pt-8 border-t border-border-subtle space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Tractor className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-wider">Farm Size</p>
                    <p className="text-lg font-bold text-foreground">{mockFarmer.stats.acres} Acres</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success-subtle text-success flex items-center justify-center">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-wider">Farming Method</p>
                    <p className="text-lg font-bold text-foreground">{mockFarmer.stats.farmingType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border-subtle">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Contact & Policies</h2>
              <ul className="space-y-4 text-foreground-secondary font-medium">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted" /> Available for calls (9am - 6pm)
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted" /> Usually responds in 1 hour
                </li>
                <li className="flex items-center gap-3 mt-6 pt-4 border-t border-border-subtle">
                  <ShieldCheck className="w-5 h-5 text-brand" /> 100% Quality Guarantee
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Products */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Available Products</h2>
              <Link to="/marketplace" className="text-brand font-bold hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-2 p-12 text-center bg-surface-elevated rounded-3xl border border-border-subtle">
                  <p className="text-foreground-secondary font-bold text-lg">No products available at the moment.</p>
                </div>
              )}
            </div>

            {/* Farm Updates or Timeline (Optional section for future) */}
            <div className="mt-12 bg-surface rounded-3xl p-8 shadow-sm border border-border-subtle">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Recent Farm Updates</h2>
              <div className="space-y-6">
                <div className="border-l-2 border-brand/30 pl-4 pb-6">
                  <p className="text-xs font-bold text-brand uppercase tracking-wider mb-1">Today</p>
                  <p className="text-foreground font-medium">Just harvested a fresh batch of organic tomatoes! Available now in limited quantities.</p>
                </div>
                <div className="border-l-2 border-border-subtle pl-4 pb-6">
                  <p className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-1">Last Week</p>
                  <p className="text-foreground font-medium">Preparing the soil for the next wheat season. Expect pre-bookings to open soon.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Container>
    </div>
  );
};

export default FarmerProfile;
