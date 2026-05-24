import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Apple } from 'lucide-react';
import type { Category } from '@/types';

const categoryStyles = [
  { color: 'bg-[#F2FCE4] dark:bg-green-900/20' }, // Light Green
  { color: 'bg-[#EBF8FE] dark:bg-blue-900/20' },  // Light Blue
  { color: 'bg-[#FDF3E1] dark:bg-orange-900/20' }, // Light Orange
  { color: 'bg-[#FCECF3] dark:bg-pink-900/20' },   // Light Pink
  { color: 'bg-[#F0F2FD] dark:bg-indigo-900/20' }, // Light Indigo
  { color: 'bg-[#FEF5E7] dark:bg-yellow-900/20' }, // Light Yellow
];

interface PopularCategoriesProps {
  categories: Category[];
}

export const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Popular Categories</h2>
        <Link to="/marketplace" className="rounded-full bg-[#111] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-black flex items-center gap-2 dark:bg-white dark:text-gray-900">
          Show All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((c, i) => {
          const style = categoryStyles[i % categoryStyles.length];
          return (
            <Link key={c.id} to={`/marketplace?category=${c.slug}`} className={`group flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-[0_4px_20px_rgb(0,0,0,0.02)]`}>
              <div className={`h-[88px] w-[88px] flex items-center justify-center mb-4 rounded-3xl ${style.color} transition-transform group-hover:scale-105`}>
                <Apple className="h-10 w-10 text-gray-700 dark:text-gray-200 opacity-60 mix-blend-multiply" />
              </div>
              <h3 className="font-bold text-[15px] text-gray-900 dark:text-white text-center leading-tight">{c.name}</h3>
              <p className="text-[11px] text-gray-400 mt-1.5 font-bold uppercase tracking-wide">{Math.floor(Math.random() * 40) + 10} Product</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
