import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';

import {
  HeroSection,
  SocialProofSection,
  PopularCategories,
  ServicesSection,
  PromoBanners,
  WeeklyBestSelling,
  ProductGridSection,
  ProductShowcaseSection,
  SuccessStoriesSection,
  MarketplaceActivitySection,
  CTASection
} from '@/components/sections';

const Home = () => {
  useSEO({
    title: 'Farmket | Farm to Table Delivery',
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
    <div className="flex flex-col bg-green-50 dark:bg-[#0A0A0A] w-full min-h-screen">
      
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Social Proof / Metrics */}
      <SocialProofSection />

      {/* E-Commerce Sections integrated into the premium flow */}
      
      {/* Popular Categories Band */}
      <section className="w-full dark:bg-[#0A0A0A] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
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
      <section className="w-full dark:bg-[#050505] py-24 border-y border-gray-100 dark:border-gray-900 mt-8">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 flex flex-col gap-24">
          <WeeklyBestSelling 
            products={products.slice(0, 5).reverse()} 
            onAddToCart={handleAddToCart}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <ProductGridSection 
            title="Most Selling Products" 
            products={products.slice(0, 5)} 
            onAddToCart={handleAddToCart} 
          />
        </div>
      </section>

      {/* Product Mockups / Showcases */}
      {/* <ProductShowcaseSection /> */}

      {/* Activity and Testimonials */}
      {/* <MarketplaceActivitySection /> */}
      
      <div className="mt-16">
        <SuccessStoriesSection />
      </div>
      
      <CTASection />

    </div>
  );
};

export default Home;