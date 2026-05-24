import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

import logo from '@/assets/images/logo.png';

const NotFound = () => {
  useSEO({ title: '404 — Page Not Found' });

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <img src={logo} alt="Farmket Logo" className="h-16 w-16 object-contain" />
          </Link>
        </div>
        {/* Illustration number */}
        <p className="text-[8rem] font-extrabold leading-none tracking-tight bg-gradient-to-br from-green-400 to-green-700 bg-clip-text text-transparent select-none">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Looks like this field is empty. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
