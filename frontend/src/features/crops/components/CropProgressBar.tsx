import React from 'react';

interface Props {
  progress: number;
  className?: string;
}

export const CropProgressBar: React.FC<Props> = ({ progress, className = '' }) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{safeProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${safeProgress}%` }}
        ></div>
      </div>
    </div>
  );
};
