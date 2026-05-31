import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { productService } from '@/features/products/services/productService';
import type { Product } from '@/types';
import { ProductCard } from '@/features/products';
import { Leaf, Clock } from 'lucide-react';

const UpcomingHarvests = () => {
  useSEO({
    title: 'Upcoming Harvests - Farmket',
    description: 'Pre-book your favorite crops directly from farmers before they are harvested.',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService.getUpcomingHarvests()
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to load upcoming harvests', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Upcoming <span className="text-green-600">Harvests</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium">
          Pre-book your favorite crops directly from farmers before they are even harvested. Secure fresh produce and support farmers early in the season.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-between bg-white dark:bg-gray-900 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
         <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
           <Leaf className="w-5 h-5 text-green-500" />
           <span className="font-bold">{products.length} Crops Growing</span>
         </div>
         <div className="flex gap-4">
           {/* Filters could go here later */}
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 border border-blue-100">
             <Clock className="w-4 h-4" /> Sorted by Harvest Date
           </div>
         </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl h-[400px]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800">
          <Clock className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">No upcoming harvests</h3>
          <p className="text-gray-500 max-w-md mx-auto font-medium">
            There are currently no crops growing that are available for pre-booking. Check back soon as farmers update their fields!
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingHarvests;
