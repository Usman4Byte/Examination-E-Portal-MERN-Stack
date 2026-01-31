import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
  outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200'
};

export const Button = ({ children, variant = 'primary', isLoading, className, ...props }) => {
  return (
    <button 
      className={cn(
        "px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
      {children}
    </button>
  );
};