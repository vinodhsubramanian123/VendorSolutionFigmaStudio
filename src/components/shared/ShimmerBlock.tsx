import React from 'react';

interface ShimmerBlockProps {
  className?: string;
}

export function ShimmerBlock({ className = '' }: ShimmerBlockProps) {
  return (
    <div className={`w-full min-h-screen bg-[#03050a] p-6 space-y-6 text-left select-none ${className}`}>
      {/* Top Bar Skeleton */}
      <div className="flex justify-between items-center bg-[#070a13] border border-white/5 p-4 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5" />
          <div className="space-y-1.5">
            <div className="h-3 w-32 bg-white/10 rounded" />
            <div className="h-2 w-48 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-8 w-24 bg-white/10 rounded-lg" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-white/5 bg-[#070a13] space-y-4 animate-pulse">
          <div className="h-4 w-1/3 bg-white/10 rounded" />
          <div className="h-8 w-1/2 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-white/5 rounded" />
            <div className="h-2.5 w-5/6 bg-white/5 rounded" />
          </div>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-[#070a13] space-y-4 animate-pulse">
          <div className="h-4 w-1/4 bg-white/10 rounded" />
          <div className="h-8 w-2/3 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-white/5 rounded" />
            <div className="h-2.5 w-4/5 bg-white/5 rounded" />
          </div>
        </div>
        <div className="p-5 rounded-xl border border-white/5 bg-[#070a13] space-y-4 animate-pulse">
          <div className="h-4 w-1/2 bg-white/10 rounded" />
          <div className="h-8 w-1/3 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-white/5 rounded" />
            <div className="h-2.5 w-3/4 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-[#070a13] border border-white/5 rounded-xl p-6 space-y-4 animate-pulse flex-1 min-h-[300px]">
        <div className="flex justify-between items-center">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
