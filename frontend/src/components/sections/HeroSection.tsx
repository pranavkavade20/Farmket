import React from 'react';
import { motion } from 'framer-motion';
import heroBg from '@/assets/images/hero/hero_section.png';
import logoImg from '@/assets/images/logo.png';
import { 
  Leaf, 
  User, 
  ShoppingCart, 
  CheckCircle2, 
  Handshake,
  Users,
  IndianRupee,
  TrendingUp,
  Package,
  ShieldCheck,
  ShoppingBag,
  BarChart3
} from 'lucide-react';

export const HeroSection = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <section className="relative w-full flex flex-col items-center pt-10 pb-10 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] overflow-hidden min-h-[90vh]">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroBg}
          alt="Farmket Hero Background" 
          className="w-full h-full object-cover object-top md:object-center"
        />
        {/* Subtle gradient to ensure text readability on all devices */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-[#f8f9fa]/90 lg:from-white/30 lg:to-transparent"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col justify-between flex-grow"
      >
        
        {/* Top Section: Farmer Text | Center Heading | Buyer Text */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-center lg:items-start mt-4 lg:mt-8 gap-8 lg:gap-4 px-2 lg:px-8">
          
          {/* Center Column - Main Heading */}
          <motion.div variants={fadeUpVariants} className="w-full lg:w-[44%] flex flex-col items-center text-center order-1 lg:order-2">
            {/* Top Tag */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-5 py-2 border border-green-200 text-green-700 font-bold text-xs sm:text-sm mb-4 sm:mb-6 shadow-sm cursor-default"
            >
              <Leaf className="w-4 h-4" /> Bridging Farms to Markets
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-[4rem] font-black text-gray-900 mb-4 sm:mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
              Grow Your Business.<br />
              Fulfill Your Requirements.<br />
              That's <span className="text-green-600">Farmket.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-800 text-base sm:text-lg lg:text-xl max-w-lg font-bold mb-4 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
              A smart marketplace connecting farmers and buyers for a better tomorrow.
            </p>
          </motion.div>

          {/* Left Column - Farmer */}
          <motion.div variants={fadeUpVariants} className="w-full sm:w-[80%] lg:w-[28%] flex flex-col items-center lg:items-start space-y-4 lg:space-y-5 lg:pt-4 order-2 lg:order-1">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 text-green-800 font-bold text-base sm:text-lg bg-white/80 backdrop-blur-md rounded-full pr-4 shadow-sm border border-green-100 cursor-default">
              <div className="border border-green-600 rounded-full p-1 m-1 flex items-center justify-center bg-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              For Farmer
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-black text-gray-900 leading-[1.1] text-center lg:text-left drop-shadow-sm">
              Sell More.<br className="hidden lg:block"/>Grow Better.
            </h2>
            <ul className="space-y-2 lg:space-y-3 pt-2 w-full flex flex-col items-center lg:items-start">
              {[
                'Reach more buyers', 
                'Get fair prices', 
                'Reduce middlemen', 
                'Grow your business'
              ].map((text, i) => (
                <motion.li 
                  key={text} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.9)" }}
                  className="flex items-center gap-2 sm:gap-3 text-gray-900 font-bold text-sm sm:text-base bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit shadow-sm cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 fill-green-100 shrink-0" /> {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column - Buyer */}
          <motion.div variants={fadeUpVariants} className="w-full sm:w-[80%] lg:w-[28%] flex flex-col items-center lg:items-end space-y-4 lg:space-y-5 lg:pt-4 order-3 lg:order-3">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center lg:flex-row-reverse gap-3 text-blue-800 font-bold text-base sm:text-lg bg-white/80 backdrop-blur-md rounded-full lg:pl-4 pr-4 lg:pr-0 shadow-sm border border-blue-100 cursor-default">
              <div className="border border-blue-600 rounded-full p-1 m-1 flex items-center justify-center bg-white">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              For Buyer
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-black text-gray-900 leading-[1.1] text-center lg:text-right drop-shadow-sm">
              Find Quality.<br className="hidden lg:block"/>Buy Smart.
            </h2>
            <ul className="space-y-2 lg:space-y-3 pt-2 w-full flex flex-col items-center lg:items-end">
              {[
                'Wide range of products', 
                'Quality you can trust', 
                'Competitive prices', 
                'On-time delivery'
              ].map((text, i) => (
                <motion.li 
                  key={text} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.9)" }}
                  className="flex items-center lg:flex-row-reverse gap-2 sm:gap-3 text-gray-900 font-bold text-sm sm:text-base bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit shadow-sm cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 fill-blue-100 shrink-0" /> {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Middle Section: Bow-tie Graphic */}
        <div className="flex-grow flex flex-col items-center justify-center relative mt-12 mb-16 lg:mt-24 lg:mb-20">
          
          <motion.div variants={scaleInVariants} className="relative flex flex-col md:flex-row items-center justify-center w-full max-w-[700px] px-4 md:px-0">
            {/* Left Green Wing */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full md:w-[45%] h-auto md:h-[180px] bg-gradient-to-br from-green-400 to-green-600 rounded-2xl md:rounded-[3rem] md:rounded-tr-sm md:rounded-br-[4rem] shadow-xl flex flex-col justify-center p-6 md:pl-8 md:pr-4 text-white z-0 border border-white/20 relative"
            >
              <div className="space-y-3 md:space-y-4 relative z-10 w-full md:w-2/3 flex flex-row md:flex-col justify-around md:justify-center">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                  <Users className="w-5 h-5 opacity-90" />
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Wider<br className="hidden md:block"/>Reach</span>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                  <div className="border border-white/40 rounded-full p-0.5">
                    <IndianRupee className="w-4 h-4 opacity-90" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Better<br className="hidden md:block"/>Prices</span>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                  <TrendingUp className="w-5 h-5 opacity-90" />
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Business<br className="hidden md:block"/>Growth</span>
                </div>
              </div>
            </motion.div>

            {/* Center Circle */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative z-20 bg-white rounded-full w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] flex flex-col items-center justify-center shadow-2xl border-4 border-white -my-4 md:-my-0 md:-mx-8 shrink-0 cursor-pointer"
            >
              <img src={logoImg} alt="Farmket Logo" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain mb-1" />
              <span className="font-extrabold text-gray-900 text-sm sm:text-base md:text-xl tracking-tight leading-none">Farmket</span>
            </motion.div>

            {/* Right Blue Wing */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full md:w-[45%] h-auto md:h-[180px] bg-gradient-to-bl from-blue-500 to-blue-700 rounded-2xl md:rounded-[3rem] md:rounded-tl-sm md:rounded-bl-[4rem] shadow-xl flex flex-col justify-center p-6 md:pr-8 md:pl-4 md:items-end text-white z-0 border border-white/20 relative"
            >
              <div className="space-y-3 md:space-y-4 relative z-10 w-full md:w-2/3 flex flex-row md:flex-col justify-around md:justify-end">
                <div className="flex flex-col md:flex-row md:flex-row-reverse items-center md:items-center gap-2 md:gap-3 text-center md:text-right">
                  <Package className="w-5 h-5 opacity-90" />
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Quality<br className="hidden md:block"/>Products</span>
                </div>
                <div className="flex flex-col md:flex-row md:flex-row-reverse items-center md:items-center gap-2 md:gap-3 text-center md:text-right">
                  <ShieldCheck className="w-5 h-5 opacity-90" />
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Trusted<br className="hidden md:block"/>Sellers</span>
                </div>
                <div className="flex flex-col md:flex-row md:flex-row-reverse items-center md:items-center gap-2 md:gap-3 text-center md:text-right">
                  <ShoppingCart className="w-5 h-5 opacity-90" />
                  <span className="text-xs sm:text-sm font-semibold leading-tight drop-shadow-md">Easy<br className="hidden md:block"/>Sourcing</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stronger Together Tag */}
          <motion.div variants={fadeUpVariants} className="mt-8 sm:mt-10 lg:mt-12 z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 sm:px-8 py-3 shadow-lg text-gray-800 font-bold border border-gray-100 text-sm sm:text-base lg:text-lg cursor-default"
            >
              <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> Stronger Together, Growing Together.
            </motion.div>
          </motion.div>

        </div>

        {/* Bottom Bar Section */}
        <motion.div variants={fadeUpVariants} className="w-full bg-white/95 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-between items-center gap-4 sm:gap-6 border border-white mt-auto z-10 max-w-7xl mx-auto">
          
          <motion.div whileHover={{ y: -5 }} className="flex items-center gap-3 sm:gap-4 w-full md:w-[45%] lg:w-auto justify-start sm:justify-center lg:justify-start cursor-default">
            <div className="bg-green-50 p-2 sm:p-3 rounded-2xl shrink-0 shadow-sm">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-tight">Thousands of</p>
              <p className="text-sm sm:text-base text-gray-900 font-extrabold leading-tight">Farmers Empowered</p>
            </div>
          </motion.div>

          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          <motion.div whileHover={{ y: -5 }} className="flex items-center gap-3 sm:gap-4 w-full md:w-[45%] lg:w-auto justify-start sm:justify-center lg:justify-start cursor-default">
            <div className="bg-green-50 p-2 sm:p-3 rounded-full border border-green-200 shrink-0 shadow-sm">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-tight">Better Incomes</p>
              <p className="text-sm sm:text-base text-gray-900 font-extrabold leading-tight">for Farmers</p>
            </div>
          </motion.div>

          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          <motion.div whileHover={{ y: -5 }} className="flex items-center gap-3 sm:gap-4 w-full md:w-[45%] lg:w-auto justify-start sm:justify-center lg:justify-start cursor-default">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-2xl shrink-0 shadow-sm">
              <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-tight">Trusted by</p>
              <p className="text-sm sm:text-base text-gray-900 font-extrabold leading-tight">Buyers Nationwide</p>
            </div>
          </motion.div>

          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          <motion.div whileHover={{ y: -5 }} className="flex items-center gap-3 sm:gap-4 w-full md:w-[45%] lg:w-auto justify-start sm:justify-center lg:justify-start cursor-default">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-2xl shrink-0 shadow-sm">
              <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-tight">Building a Stronger</p>
              <p className="text-sm sm:text-base text-gray-900 font-extrabold leading-tight">Agri-Ecosystem</p>
            </div>
          </motion.div>

        </motion.div>

      </motion.div>
    </section>
  );
};