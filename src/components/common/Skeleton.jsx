import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-soft-beige/70 rounded-xs',
        className
      )}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="w-full aspect-[3/4] rounded-sm" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
};

