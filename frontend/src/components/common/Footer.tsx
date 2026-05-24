import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.png';
import { ArrowRight } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0A0A0A] overflow-hidden w-full border-t border-gray-100 dark:border-gray-900 mt-20">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Socials */}
          <div className="col-span-1 md:col-span-4 pr-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={logo} alt="Farmket Logo" className="h-10 w-10 object-contain" />
              <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                Farmket
              </span>
            </Link>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed max-w-sm">
              Connecting farmers directly with buyers for a sustainable, fresh, and organic agricultural future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#168748] hover:text-white dark:bg-gray-900 dark:hover:bg-[#168748] transition-all">
                <XIcon />
              </a>
              <a href="#" className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#168748] hover:text-white dark:bg-gray-900 dark:hover:bg-[#168748] transition-all">
                <GithubIcon />
              </a>
              <a href="#" className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#168748] hover:text-white dark:bg-gray-900 dark:hover:bg-[#168748] transition-all">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Platform</h3>
            <ul className="space-y-4">
              {['Marketplace', 'Categories', 'Deals', 'Pricing', 'About Us'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="text-[15px] font-bold text-gray-500 hover:text-[#168748] dark:text-gray-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4">
              {['Help Center', 'Track Order', 'Terms of Service', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="text-[15px] font-bold text-gray-500 hover:text-[#168748] dark:text-gray-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="col-span-1 md:col-span-4">
            <div className="rounded-[2rem] bg-[#F5F5F5] dark:bg-gray-900 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join our Newsletter</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Get exclusive discounts and seasonal offers directly to your inbox.</p>
              <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email address..."
                  className="w-full rounded-full border-none bg-white py-4 pl-6 pr-14 text-sm font-medium text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-[#168748] dark:bg-gray-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 w-10 rounded-full bg-[#111] flex items-center justify-center text-white hover:bg-black hover:scale-105 transition-all shadow-md"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-bold text-gray-400">
            &copy; {new Date().getFullYear()} Farmket Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
             <button className="hover:text-gray-900 dark:hover:text-white transition-colors">English (EN)</button>
             <button className="hover:text-gray-900 dark:hover:text-white transition-colors">USD ($)</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;