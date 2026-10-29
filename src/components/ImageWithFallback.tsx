import React, { useState } from 'react';
import { Wrench, Shield, HardHat, Sparkles } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: 'tool' | 'mechanic' | 'service' | 'workshop';
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Image',
  fallbackCategory = 'tool',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-3 text-center text-slate-400 ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-amber-500 mb-1">
          {fallbackCategory === 'tool' && <Wrench className="w-5 h-5" />}
          {fallbackCategory === 'mechanic' && <HardHat className="w-5 h-5 text-blue-400" />}
          {fallbackCategory === 'service' && <Shield className="w-5 h-5 text-amber-400" />}
          {fallbackCategory === 'workshop' && <Sparkles className="w-5 h-5 text-amber-400" />}
        </div>
        <span className="text-[10px] font-semibold text-slate-300 line-clamp-1">{alt}</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Craft & Care Fleet</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <Wrench className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
