import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';

import {
  HeroSection,
  PopularCategories,
  ProductGridSection,
  PromoBanners,
  WeeklyBestSelling,
  CTASection
} from '@/components/sections';

const Home = () => {
  useSEO({
    title: 'Farmket | Farm to Table Delivery',
    description: 'Shop from thousands of farm-fresh fruits, vegetables, dairy, and daily essentials at unbeatable prices.',
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
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5] dark:bg-[#0A0A0A] w-full min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-16">
        
        <HeroSection />

        <PopularCategories categories={categoriesList} />

        <ProductGridSection 
          title="Today's Fresh Picks" 
          products={products.slice(0, 5)} 
          onAddToCart={handleAddToCart} 
        />

        <PromoBanners />

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

        <CTASection />

      </div>
    </div>
  );
};

export default Home;