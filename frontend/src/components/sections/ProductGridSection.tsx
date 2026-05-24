import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products';
import type { Product } from '@/types';

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductGridSection = ({ title, products, onAddToCart }: ProductGridSectionProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h2>
        <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
          Show All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};
