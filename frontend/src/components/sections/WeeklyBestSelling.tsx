import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products';
import type { Product } from '@/types';

interface WeeklyBestSellingProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = ['Fresh Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Meat & Fish', 'Beverages'];

export const WeeklyBestSelling = ({ products, onAddToCart, activeTab, setActiveTab }: WeeklyBestSellingProps) => {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Weekly Best Selling items</h2>
        <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900 self-start md:self-auto">
          Show All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
        {TABS.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === tab 
              ? 'bg-[#168748] text-white shadow-md' 
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};
