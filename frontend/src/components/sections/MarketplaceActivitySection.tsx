import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import tomatoImg from '@/assets/images/hero/hero_icon_tomato.png';
import broccoliImg from '@/assets/images/hero/hero_icon_broccoli.png';

const activities = [
  { time: 'Just now', type: 'LISTING', crop: 'Organic Tomatoes', qty: '500 kg', price: '₹12/kg', loc: 'Nashik, MH', img: tomatoImg },
  { time: '2m ago', type: 'SALE', crop: 'Fresh Potatoes', qty: '2 Tons', price: '₹18/kg', loc: 'Indore, MP', img: broccoliImg }, // Placeholder img
  { time: '5m ago', type: 'LISTING', crop: 'Green Cabbage', qty: '100 kg', price: '₹8/kg', loc: 'Pune, MH', img: broccoliImg },
  { time: '12m ago', type: 'SALE', crop: 'Red Onions', qty: '5 Tons', price: '₹22/kg', loc: 'Nashik, MH', img: tomatoImg }, // Placeholder img
];

export const MarketplaceActivitySection = () => {
  return (
    <section className="w-full bg-green-50 dark:bg-[#0A0A0A] py-24 border-b border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          
          <div className="w-full lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 mb-6"
            >
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Live Pulse</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
            >
              A living, breathing marketplace.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-8"
            >
              Every second, farmers are listing fresh produce and buyers are securing bulk deals. Watch the agricultural economy flow in real-time.
            </motion.p>
            <button className="px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-md transition-all hover:scale-105">
              Enter Marketplace
            </button>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="relative">
              {/* Fade out top/bottom */}
              <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white dark:from-[#0A0A0A] to-transparent z-10"></div>
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent z-10"></div>
              
              <div className="flex flex-col gap-4 max-h-[500px] overflow-hidden relative">
                <motion.div
                  animate={{ y: [0, -300] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="flex flex-col gap-4"
                >
                  {[...activities, ...activities].map((act, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm p-2">
                          <img src={act.img} alt="crop" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${act.type === 'SALE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {act.type}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {act.time}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{act.crop} • <span className="text-gray-500">{act.qty}</span></h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[#168748]">{act.price}</div>
                        <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{act.loc}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
