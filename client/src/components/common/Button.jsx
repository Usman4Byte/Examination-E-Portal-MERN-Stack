import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
};

export const Button = ({ children, variant = 'primary', isLoading, className, ...props }) => {
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};