'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-80 h-80 mb-12">
        <div className="spinner-outer"></div>
        <div className="spinner-middle"></div>
        <div className="spinner-inner"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/logoA.png"
            alt="AIM Academy"
            width={120}
            height={120}
            priority
            className="object-contain"
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="flex space-x-3">
          <div className="dot"></div>
          <div className="dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <div className="text-center">
          <p className="text-white text-base font-bold tracking-[0.3em] mb-1">LOADING</p>
          <p className="text-gray-400 text-xs tracking-wider">Please wait...</p>
        </div>
      </div>

      <style jsx>{`
        .spinner-outer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 5px solid transparent;
          border-top-color: #dc2626;
          border-right-color: #dc2626;
          border-radius: 50%;
          animation: spin-slow 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.4));
        }

        .spinner-middle {
          position: absolute;
          top: 10%;
          left: 10%;
          width: 80%;
          height: 80%;
          border: 4px solid transparent;
          border-bottom-color: #ef4444;
          border-left-color: #ef4444;
          border-radius: 50%;
          animation: spin-medium 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.3));
        }

        .spinner-inner {
          position: absolute;
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          border: 3px solid transparent;
          border-top-color: #f87171;
          border-radius: 50%;
          animation: spin-fast 1.5s linear infinite;
          filter: drop-shadow(0 0 6px rgba(248, 113, 113, 0.2));
        }

        .dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          border-radius: 50%;
          animation: bounce-smooth 1.4s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(220, 38, 38, 0.5);
        }

        @keyframes spin-slow {
          0% { 
            transform: rotate(0deg);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes spin-medium {
          0% { 
            transform: rotate(0deg);
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
          100% { 
            transform: rotate(-360deg);
            opacity: 0.6;
          }
        }

        @keyframes spin-fast {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-smooth {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-12px) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}