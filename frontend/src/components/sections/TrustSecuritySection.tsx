import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint, BadgeCheck } from 'lucide-react';

export const TrustSecuritySection = () => {
  return (
    <section className="w-full bg-white dark:bg-[#0A0A0A] py-24 lg:py-32 border-b border-gray-100 dark:border-gray-900">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 mb-6">
              <Lock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Enterprise Security</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
              A foundation of trust. <br />
              Secure from soil to sale.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-10">
              We employ bank-grade security protocols, robust identity verification, and transparent data practices to ensure every transaction is completely secure.
            </p>

            <div className="space-y-8">
              {[
                { icon: BadgeCheck, title: "Verified Farmers Only", desc: "Every farmer undergoes a strict onboarding process including KYC and land verification." },
                { icon: ShieldCheck, title: "Escrow-based Payments", desc: "Funds are held securely until delivery is confirmed, protecting both parties." },
                { icon: Fingerprint, title: "End-to-End Encryption", desc: "Your personal and financial data is encrypted using industry-standard protocols." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full max-w-md"
            >
               {/* Decorative background glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full"></div>
               
               {/* Core Card */}
               <div className="relative z-10 bg-white dark:bg-[#0A0A0A] p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-2xl text-center">
                 <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800">
                    <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">100% Secured</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
                   Protected by industry-leading security standards.
                 </p>
                 
                 <div className="flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 px-4 rounded flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">AES-256</div>
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 px-4 rounded flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">PCI-DSS</div>
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 px-4 rounded flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">ISO 27001</div>
                 </div>
               </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
