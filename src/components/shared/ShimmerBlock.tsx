import React from 'react';

interface ShimmerBlockProps {
  className?: string;
}

export function ShimmerBlock({ className = '' }: ShimmerBlockProps) {
  return (
    <div
      className={`animate-pulse bg-white/5 border border-white/10 rounded-xl ${className}`}
    ></div>
  );
}
