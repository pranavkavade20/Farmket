import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from "sonner";

import {
  HeroSection,
  SocialProofSection,
  ProblemSolutionSection,
  HowItWorksSection,
  FeaturesBentoSection,
  PopularCategories,
  ServicesSection,
  PromoBanners,
  WeeklyBestSelling,
  ProductGridSection,
  ProductShowcaseSection,
  SuccessStoriesSection,
  MarketplaceActivitySection,
  FAQSection,
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
    <div className="flex flex-col bg-white dark:bg-[#050505] w-full min-h-screen transition-colors duration-300">
      
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Social Proof */}
      <SocialProofSection />


      {/* E-Commerce Sections integrated into the premium flow */}
      <section className="w-full bg-[#FAFAF8] dark:bg-[#0A0A0A] py-20 border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-8 lg:px-12">
           <PopularCategories categories={categoriesList} />
        </div>
      </section>

      {/* Services Band */}
      <section className="w-full dark:bg-[#0A0A0A] pb-16 pt-4">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
           <ServicesSection />
        </div>
      </section>

      {/* Promo Banners Band */}
      <section className="w-full dark:bg-[#0A0A0A] py-8">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
           <PromoBanners />
        </div>
      </section>

      {/* Products Band */}
      <section className="w-full bg-white dark:bg-[#050505]">
        <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-8 lg:px-12 flex flex-col">
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
      <div className="mt-16 border-t border-gray-100 dark:border-white/5">
        <SuccessStoriesSection />
      </div>
      
      <CTASection />

    </div>
  );
};

export default Home;