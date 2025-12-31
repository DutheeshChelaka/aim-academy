import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="relative bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6 sm:p-8 overflow-hidden">
      <div className="flex flex-col items-center">
        {/* Number skeleton */}
        <div className="w-20 h-20 bg-gray-300 rounded-2xl mb-3 animate-pulse"></div>
        
        {/* Text skeleton */}
        <div className="w-24 h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
        <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
      </div>
      
      {/* Arrow skeleton */}
      <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
  );
};

export const SkeletonStat = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 overflow-hidden">
      <div className="flex flex-col items-center">
        {/* Icon skeleton */}
        <div className="w-16 h-16 bg-gray-300 rounded-2xl mb-4 animate-pulse"></div>
        
        {/* Number skeleton */}
        <div className="w-20 h-12 bg-gray-300 rounded mb-2 animate-pulse"></div>
        
        {/* Label skeleton */}
        <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export const SkeletonFeature = () => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 overflow-hidden">
      {/* Icon skeleton */}
      <div className="w-14 h-14 bg-gray-300 rounded-xl mb-4 animate-pulse"></div>
      
      {/* Title skeleton */}
      <div className="w-32 h-6 bg-gray-300 rounded mb-2 animate-pulse"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-3/4 h-3 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
};