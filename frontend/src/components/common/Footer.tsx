import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.png';
import { ArrowRight, Leaf } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.181a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#050505] overflow-hidden w-full border-t border-gray-100 dark:border-white/5 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[200px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Socials */}
          <div className="col-span-1 md:col-span-4 lg:pr-12">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                Farmket
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed max-w-sm">
              Connecting farmers directly with buyers for a sustainable, fresh, and organic agricultural future. No middlemen, absolute transparency.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-10 w-10 rounded-full glass border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 dark:hover:border-brand-400 hover:scale-110 transition-all duration-300 shadow-sm">
                <XIcon />
              </a>
              <a href="#" className="h-10 w-10 rounded-full glass border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 dark:hover:border-brand-400 hover:scale-110 transition-all duration-300 shadow-sm">
                <WhatsappIcon />
              </a>
              <a href="#" className="h-10 w-10 rounded-full glass border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 dark:hover:border-brand-400 hover:scale-110 transition-all duration-300 shadow-sm">
                <InstagramIcon />
              </a>
              <a href="#" className="h-10 w-10 rounded-full glass border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 dark:hover:border-brand-400 hover:scale-110 transition-all duration-300 shadow-sm">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="col-span-1 md:col-span-2 md:pl-8">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-6">Product</h3>
            <ul className="space-y-4">
              {[
                { name: 'Features', to: '/about#features' },
                { name: 'How It Works', to: '/about#how-it-works' },
                { name: 'Pricing', to: '/pricing' },
                { name: 'Marketplace', to: '/marketplace' },
                { name: 'Success Stories', to: '/#success-stories' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-block hover:translate-x-1 transform duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', to: '/about' },
                { name: 'Careers', to: '/careers' },
                { name: 'Blog', to: '/blog' },
                { name: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-block hover:translate-x-1 transform duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="col-span-1 md:col-span-4">
            <div className="glass-card rounded-[2rem] border border-gray-200 dark:border-white/5 p-8 relative overflow-hidden group">
              {/* Card Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-400/20 dark:bg-brand-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center border border-brand-100 dark:border-brand-800/50">
                  <Leaf className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Join our Newsletter</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium relative z-10">Get exclusive discounts and seasonal offers directly to your inbox.</p>
              
              <form className="relative flex items-center z-10" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email address..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-sm py-3.5 pl-5 pr-14 text-sm font-medium text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 dark:text-white focus:border-brand-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 h-[36px] w-[36px] rounded-xl bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-500/20"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-sm font-bold text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} Farmket Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-400 dark:text-gray-600">
             <button className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">English (EN)</button>
             <button className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">INR (₹)</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;