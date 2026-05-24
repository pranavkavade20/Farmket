import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import hero_section from '@/assets/images/hero.jpg';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-[#168748] px-8 py-16 sm:py-24 lg:px-16 shadow-xl w-full min-h-[500px] flex items-center">
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 w-full">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-6xl sm:text-7xl lg:text-[7rem] font-bold tracking-tighter text-white leading-[0.9] mb-8 font-sans">
            Farm<span className="text-[#B9F046]">ket</span>
          </h1>

          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-md border border-white/20 mb-8 absolute top-0 right-0 lg:right-auto lg:left-0 lg:-top-6 hidden lg:inline-flex">
            Same-Day Delivery
          </div>

          <p className="max-w-[400px] text-[15px] text-white/90 leading-relaxed font-medium mb-10">
            Shop from thousands of farm-fresh fruits, vegetables, dairy, and daily essentials at unbeatable prices.
          </p>

          <Button size="lg" className="rounded-full bg-[#0A2617] hover:bg-black text-white px-8 py-7 text-[15px] font-bold shadow-xl border-none transition-transform hover:scale-105">
            Shop Now <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Right side floating image container */}
        <div className="relative hidden lg:flex items-end justify-center">
          <img 
            src={hero_section} 
            alt="Delivery person" 
            className="w-full max-w-[500px] object-contain drop-shadow-2xl z-20 relative h-[500px] object-right-bottom mix-blend-normal"
            style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 15%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
          />
          {/* Floating Card */}
          <div className="absolute bottom-16 -left-8 z-30 flex items-center gap-4 rounded-[1.5rem] bg-white/95 p-4 shadow-2xl backdrop-blur-xl border border-white/40 min-w-[220px]">
            <div className="h-16 w-16 rounded-[1rem] bg-[#F2FCE4] flex items-center justify-center text-3xl shadow-sm">
              🥬
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">Fresh Vegetables</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">$18.00 <span className="line-through text-gray-400 text-xs ml-1 font-semibold">$24.00</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
