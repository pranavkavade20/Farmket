import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products';
import type { Product, Category } from '@/types';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';

import {
  HeroSection,
  SocialProofSection,
  PopularCategories,
  WeeklyBestSelling,
  ProductGridSection,
  SuccessStoriesSection,
  CTASection,
} from '@/components/sections';

import { Container, Section } from '@/components/ui';

const ALL_CATEGORIES_TAB = 'All Produce';

const Home = () => {
  useSEO({
    title: 'Farmket | Direct Farmer-to-Buyer Agricultural Marketplace',
    description:
      'Discover and purchase farm-fresh agricultural produce directly from farmers, or list your harvest with transparent unit pricing and clear availability.',
  });

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>(ALL_CATEGORIES_TAB);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingProducts(true);
    productService
      .getFeaturedProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      });

    setIsLoadingCategories(true);
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategoriesList(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategoriesList([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add produce to your cart.', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login'),
        },
      });
      return;
    }
    await addToCart(product);
  };

  // Filter featured products by selected category tab when applicable
  const filteredFeaturedProducts = useMemo(() => {
    if (!activeTab || activeTab === ALL_CATEGORIES_TAB) {
      return products.slice(0, 8);
    }

    const normalizedTab = activeTab.trim().toLowerCase();
    return products
      .filter((product) => {
        const record = product as unknown as Record<string, unknown>;
        const categoryField = record.category;
        const categoryName =
          typeof categoryField === 'string'
            ? categoryField
            : categoryField &&
                typeof categoryField === 'object' &&
                'name' in categoryField &&
                typeof (categoryField as { name?: unknown }).name === 'string'
              ? (categoryField as { name: string }).name
              : typeof record.category_name === 'string'
                ? record.category_name
                : '';

        return categoryName.toLowerCase() === normalizedTab;
      })
      .slice(0, 8);
  }, [products, activeTab]);

  // Secondary discovery list for additional inventory
  const additionalProducts = useMemo(() => {
    return products.slice(8, 12);
  }, [products]);

  return (
    <div className="flex flex-col bg-background w-full min-h-screen transition-colors duration-300 text-foreground">
      {/* 1. Hero: Value proposition & dual Farmer/Buyer entry points */}
      <HeroSection />

      {/* 2. Platform Architecture & Live Marketplace Transparency */}
      <SocialProofSection />

      {/* 3. Product Category Discovery */}
      <Section className="bg-background border-b border-border-subtle" spacing="lg">
        <Container>
          <PopularCategories
            categories={categoriesList}
            isLoading={isLoadingCategories}
          />
        </Container>
      </Section>

      {/* 4. Featured Agricultural Produce with working category filtering */}
      <Section className="bg-surface/40 border-b border-border-subtle" spacing="lg">
        <Container>
          <WeeklyBestSelling
            products={filteredFeaturedProducts}
            onAddToCart={handleAddToCart}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            categories={categoriesList}
            isLoading={isLoadingProducts}
          />
        </Container>
      </Section>

      {/* 5. Additional Marketplace Listings (when more than 8 featured items exist) */}
      {!isLoadingProducts && additionalProducts.length > 0 && (
        <Section className="bg-background border-b border-border-subtle" spacing="lg">
          <Container>
            <ProductGridSection
              title="More Fresh Arrivals"
              products={additionalProducts}
              onAddToCart={handleAddToCart}
              badge="Available Now"
            />
          </Container>
        </Section>
      )}

      {/* 6. How Farmket Works & Dual-Journey Value Proposition */}
      <SuccessStoriesSection />

      {/* 7. Final Role-Based Call to Action */}
      <CTASection />
    </div>
  );
};

export default Home;
