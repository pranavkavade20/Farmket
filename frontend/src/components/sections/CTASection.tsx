import React from 'react';

export const CTASection = () => {
  return (
    <section>
      <div className="rounded-[3rem] bg-[#EBF8FE] dark:bg-blue-950/20 px-10 py-16 lg:px-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="relative z-10 md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2617] dark:text-white mb-6 leading-[1.1]">
            Ready To Fill Your Cart With Freshness?
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-8 font-medium max-w-md">
            Shop farm-fresh groceries, daily essentials, and exclusive deals delivered straight to your door.
          </p>
          <div className="flex items-center gap-4">
            <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">App Store</button>
            <button className="h-14 px-8 bg-[#111] rounded-2xl text-white flex items-center justify-center font-bold hover:bg-black transition-colors shadow-xl text-sm">Google Play</button>
          </div>
        </div>
        
        <div className="md:w-1/2 relative flex justify-end">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/50 dark:bg-blue-900/30 blur-3xl rounded-full" />
          {/* Fallback Basket */}
          <div className="relative z-10 h-72 w-72 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-2xl ring-[12px] ring-white/50 dark:ring-gray-900/50">
             <span className="text-9xl drop-shadow-2xl">🛒</span>
          </div>
        </div>
      </div>
    </section>
  );
};
