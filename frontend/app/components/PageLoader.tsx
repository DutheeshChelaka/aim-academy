'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import animationData from '@/public/images/spinnerAni.json';

// Dynamically import Lottie (heavy package) to prevent it from blocking the main initial JS bundle
// This improves LCP (Largest Contentful Paint) and speeds up initial page load dramatically.
const Lottie = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => (
    // Premium CSS-only shimmer loading spinner fallback while Lottie loads
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-full border-2 border-red-500/10 border-t-2 border-t-red-600 animate-spin"></div>
      <div className="w-10 h-10 rounded-full bg-red-600/10 animate-ping"></div>
    </div>
  )
});

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsLoading(false), 300);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow circle for premium feel */}
      <div className="absolute w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        
        {/* Lottie Animation Wrapper */}
        <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center">
          <Lottie 
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Subtle, premium loading indicator text */}
        <div className="text-center space-y-1.5 animate-pulse duration-1500 pointer-events-none">
          <span className="text-xs uppercase tracking-[0.25em] font-black text-red-500/80">AIM ACADEMY</span>
          <p className="text-[10px] text-zinc-500 tracking-[0.1em] font-light">Loading excellence...</p>
        </div>

      </div>
    </div>
  );
}