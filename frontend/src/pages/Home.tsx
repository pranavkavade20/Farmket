import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from "sonner";

import {
  HeroSection,
  SocialProofSection,
  PopularCategories,
  WeeklyBestSelling,
  ProductGridSection,
  SuccessStoriesSection,
  CTASection
} from '@/components/sections';

const Home = () => {
  useSEO({
    title: 'Farmket | Modern Agricultural Commerce',
    description: 'A revolutionary platform connecting farmers directly with buyers. No middlemen. Absolute transparency.',
  });

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('Fresh Vegetables');

  useEffect(() => {
    productService.getFeaturedProducts()
      .then(setProducts)
      .catch(() => { /* silent */ });

    productService.getCategories()
      .then(setCategoriesList)
      .catch(() => { /* silent */ });
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please log in to add items to cart', { icon: '🔒' });
      return;
    }
    await addToCart(product);
  };

  return (
    <div className="flex flex-col bg-background w-full min-h-screen transition-colors duration-300 text-foreground">

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Social Proof */}
      <SocialProofSection />

      {/* 3. Marketplace Preview */}
      <section className="w-full bg-surface py-20 border-b border-border-subtle">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <PopularCategories categories={categoriesList} />
        </div>
      </section>

      {/* Products Band */}
      <section className="w-full bg-background border-t border-border-subtle pt-24 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 flex flex-col gap-24">
          <WeeklyBestSelling
            products={products.slice(0, 5).reverse()}
            onAddToCart={handleAddToCart}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <ProductGridSection
            title="Trending Products"
            products={products.slice(0, 5)}
            onAddToCart={handleAddToCart}
            badge="Trending"
          />
        </div>
      </section>

      {/* Activity and Testimonials */}
      <div className="mt-8 border-t border-border-subtle bg-surface">
        <SuccessStoriesSection />
      </div>

      <CTASection />

    </div>
  );
};

export default Home;