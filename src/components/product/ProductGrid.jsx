import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { cn } from '../../utils/cn';

export const ProductGrid = ({ products = [], loading = false, skeletonCount = 8, className }) => {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

