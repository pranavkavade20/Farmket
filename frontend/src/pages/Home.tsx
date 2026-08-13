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

import { Container, Section, Stack } from '@/components/ui';

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
      <Section className="bg-surface border-b border-border-subtle" spacing="lg">
        <Container>
          <PopularCategories categories={categoriesList} />
        </Container>
      </Section>

      {/* Products Band */}
      <Section className="bg-background border-t border-border-subtle" spacing="lg">
        <Container>
          <Stack gap="xl">
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
          </Stack>
        </Container>
      </Section>

      {/* Activity and Testimonials */}
      <div className="mt-8 border-t border-border-subtle bg-surface">
        <SuccessStoriesSection />
      </div>

      <CTASection />

    </div>
  );
};

export default Home;