import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatters';
import { buildImageUrl } from '../../lib/imagekit';
import { cn } from '../../utils/cn';
import { Badge } from '../common/Badge';

export const ProductCard = ({ product, className }) => {
  const { toggle, isWishlisted } = useWishlist();
  const toast = useToast();
  const [hovered, setHovered] = useState(false);

  if (!product) return null;

  const primaryImage = product.images?.find((img) => img.is_primary)?.imagekit_url
    || product.images?.[0]?.imagekit_url
    || null;

  const secondaryImage = product.images?.find((img) => !img.is_primary && img.display_order > 0)?.imagekit_url
    || product.images?.[1]?.imagekit_url
    || null;

  const effectivePrice = product.discount_price ?? product.base_price;
  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const discountPct = hasDiscount
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  const wishlisted = isWishlisted(product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast.info(wishlisted ? `Removed from wishlist.` : `Added to wishlist.`);
  };

  return (
    <article
      className={cn('group relative flex flex-col', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-soft-beige/40 aspect-[3/4] rounded-xs"
        aria-label={`View ${product.name}`}
      >
        {/* Primary Image */}
        {primaryImage ? (
          <motion.img
            src={buildImageUrl(primaryImage, { width: 600, height: 800, quality: 85 })}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: (hovered && secondaryImage) ? 0 : 1 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-soft-beige flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-soft-beige" />
          </div>
        )}

        {/* Secondary Hover Image */}
        {secondaryImage && (
          <motion.img
            src={buildImageUrl(secondaryImage, { width: 600, height: 800, quality: 85 })}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.is_new_arrival && (
            <Badge variant="new" size="xs">New</Badge>
          )}
          {hasDiscount && (
            <Badge variant="sale" size="xs">-{discountPct}%</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlistToggle}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-soft',
            wishlisted
              ? 'bg-charcoal text-white'
              : 'bg-white/90 text-charcoal hover:bg-white'
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
        >
          <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-current')} />
        </motion.button>

        {/* Quick View Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <Link
                to={`/products/${product.slug}`}
                className="block w-full text-center bg-white/95 backdrop-blur-sm text-charcoal text-xs font-semibold uppercase tracking-wider-brand py-2.5 rounded-xs hover:bg-charcoal hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Quick View
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-1 flex-1">
        {product.category && (
          <p className="text-[11px] uppercase tracking-wider-brand text-muted-text">
            {product.category?.name || product.gender}
          </p>
        )}
        <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2 group-hover:text-muted-olive transition-colors">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-semibold text-charcoal">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-text line-through">
              {formatPrice(product.base_price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

