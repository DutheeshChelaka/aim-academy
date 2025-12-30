'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '@/public/images/spinnerAni.json';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsLoading(false), 300);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Lottie Animation Only */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
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
    </div>
  );
}