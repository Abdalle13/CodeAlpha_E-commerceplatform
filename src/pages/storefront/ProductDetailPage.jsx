import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Truck, RefreshCw, Shield, Package, AlertCircle, Check,
} from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { buildImageUrl, IMAGE_PRESETS } from '../../lib/imagekit';
import { formatPrice } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Skeleton } from '../../components/common/Skeleton';

// ─── Delivery accordion data ───────────────────────────────────────────────────
const DELIVERY_ACCORDION = [
  {
    id: 'delivery',
    icon: Truck,
    title: 'Delivery Information',
    content: `HILAARA delivers nationwide across Somalia. Standard delivery to Mogadishu is 1-3 business days. Regional delivery to Hargeisa, Garowe, Kismayo, and other cities is 3-5 business days. Delivery fees are calculated at checkout based on your location.`,
  },
  {
    id: 'returns',
    icon: RefreshCw,
    title: 'Returns and Exchanges',
    content: `Unworn, unwashed items in original condition may be returned within 14 days of delivery. Items must have all original tags attached. Contact our support team to initiate a return or exchange.`,
  },
  {
    id: 'authenticity',
    icon: Shield,
    title: 'Authenticity Guarantee',
    content: `Every HILAARA product is verified for quality before dispatch. If you receive a defective or incorrect item, we will arrange a replacement or full refund at no additional cost.`,
  },
  {
    id: 'packaging',
    icon: Package,
    title: 'Packaging',
    content: `Your order will be carefully folded and packed in HILAARA tissue paper. Gift-ready packaging is available at checkout for an additional fee.`,
  },
];

// ─── Accordion item ────────────────────────────────────────────────────────────
const AccordionItem = ({ item, open, onToggle }) => {
  const Icon = item.icon;
  return (
    <div className="border-b border-soft-beige last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-muted-olive flex-shrink-0" />
          <span className="text-sm font-medium text-charcoal group-hover:text-muted-olive transition-colors">
            {item.title}
          </span>
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-text flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-text flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-text leading-relaxed pb-4 pl-7">
              {item.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images, productName }) => {
  const sorted = [...(images || [])].sort((a, b) => a.display_order - b.display_order);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = sorted[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));

  if (!sorted.length) {
    return (
      <div className="aspect-[3/4] bg-soft-beige/60 rounded-xs flex items-center justify-center">
        <div className="text-center space-y-2 opacity-30">
          <img src="/brand/hilaara-mark-dark.svg" alt="" className="h-12 w-auto mx-auto" />
          <p className="text-xs uppercase tracking-widest-brand text-charcoal">No Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-soft-beige/40 rounded-xs overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={buildImageUrl(activeImage.imagekit_url, IMAGE_PRESETS.productDetail)}
            alt={activeImage.alt_text || productName}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            loading="eager"
          />
        </AnimatePresence>

        {/* Nav arrows — only show when multiple images */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-charcoal" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-charcoal" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === activeIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {sorted.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-shrink-0 w-16 h-20 rounded-xs overflow-hidden border-2 transition-all',
                i === activeIndex ? 'border-charcoal' : 'border-transparent opacity-60 hover:opacity-100'
              )}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <img
                src={buildImageUrl(img.imagekit_url, IMAGE_PRESETS.thumbnail)}
                alt={img.alt_text || `${productName} ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Variant selector helpers ──────────────────────────────────────────────────

function getUniqueSizes(variants) {
  const seen = new Set();
  return variants.filter((v) => v.is_active && !seen.has(v.size) && seen.add(v.size));
}

function getColorsForSize(variants, size) {
  const seen = new Set();
  return variants.filter(
    (v) => v.is_active && v.size === size && !seen.has(v.color_name) && seen.add(v.color_name)
  );
}

function findVariant(variants, size, colorName) {
  return variants.find((v) => v.is_active && v.size === size && v.color_name === colorName) || null;
}

function getStockLevel(variant) {
  const qty = variant?.inventory?.quantity ?? 0;
  const low = variant?.inventory?.low_stock_threshold ?? 5;
  if (qty === 0) return 'out';
  if (qty <= low) return 'low';
  return 'in';
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
const PDPSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <Skeleton className="aspect-[3/4] rounded-xs" />
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// ─── Main PDP component ────────────────────────────────────────────────────────
export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Variant selector state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState('delivery');

  const wishlisted = product ? isWishlisted(product.id) : false;

  // Fetch product
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    setAddedToCart(false);

    getProductBySlug(slug).then(({ data, error }) => {
      if (!data || error) {
        setNotFound(true);
      } else {
        setProduct(data);
        // Auto-select first available size
        const activeVariants = data.variants?.filter((v) => v.is_active) || [];
        if (activeVariants.length > 0) {
          setSelectedSize(activeVariants[0].size);
          setSelectedColor(activeVariants[0].color_name);
        }
      }
      setLoading(false);
    });
  }, [slug]);

  // Fetch related products once product is loaded
  useEffect(() => {
    if (!product) return;
    setRelatedLoading(true);
    getRelatedProducts(product.id, {
      gender: product.gender,
      categoryId: product.category?.id,
      limit: 4,
    }).then(({ data }) => {
      setRelatedProducts(data || []);
      setRelatedLoading(false);
    });
  }, [product]);

  const activeVariants = product?.variants?.filter((v) => v.is_active) || [];
  const uniqueSizes = getUniqueSizes(activeVariants);
  const colorsForSelectedSize = selectedSize ? getColorsForSize(activeVariants, selectedSize) : [];
  const selectedVariant = selectedSize && selectedColor
    ? findVariant(activeVariants, selectedSize, selectedColor)
    : null;
  const stockLevel = getStockLevel(selectedVariant);

  const effectivePrice = product
    ? (selectedVariant?.price_override ?? product.discount_price ?? product.base_price)
    : 0;
  const hasDiscount = product?.discount_price && product.discount_price < product.base_price;
  const discountPct = hasDiscount
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Reset color to first available for this size
    const colors = getColorsForSize(activeVariants, size);
    setSelectedColor(colors[0]?.color_name || null);
  };

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant) {
      toast.error('Please select a size and color before adding to cart.');
      return;
    }
    if (stockLevel === 'out') {
      toast.error('This variant is currently out of stock.');
      return;
    }
    addItem(product, selectedVariant, quantity);
    setAddedToCart(true);
    toast.success(`${product.name} added to your cart.`);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [selectedVariant, stockLevel, addItem, product, quantity, toast]);

  const handleWishlistToggle = () => {
    if (!product) return;
    toggle(product.id);
    toast.info(wishlisted ? 'Removed from wishlist.' : 'Saved to wishlist.');
  };

  // Not found
  if (!loading && notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-6">
        <AlertCircle className="w-10 h-10 text-muted-text mx-auto" />
        <h1 className="font-serif text-3xl font-medium text-charcoal">Product not found</h1>
        <p className="text-muted-text text-sm">
          This product may have been removed or is no longer available.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop"><Button variant="primary" size="md">Browse All Products</Button></Link>
          <Button variant="outline" size="md" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (loading) return <PDPSkeleton />;

  return (
    <div className="bg-warm-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-text mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category ? (
            <>
              <Link
                to={`/collections/${product.gender}`}
                className="hover:text-charcoal transition-colors capitalize"
              >
                {product.gender === 'men' ? "Men" : product.gender === 'women' ? "Women" : "Shop"}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-muted-text">{product.category.name}</span>
              <ChevronRight className="w-3 h-3" />
            </>
          ) : (
            <>
              <Link to="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-charcoal font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main product grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left — Image gallery */}
          <ImageGallery images={product.images} productName={product.name} />

          {/* Right — Product info and actions */}
          <div className="space-y-7">

            {/* Badges */}
            <div className="flex items-center gap-2">
              {product.is_new_arrival && <Badge variant="new" size="xs">New Arrival</Badge>}
              {hasDiscount && <Badge variant="sale" size="xs">-{discountPct}% Off</Badge>}
              {product.category && (
                <span className="text-xs uppercase tracking-wider-brand text-muted-olive font-medium">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Name and price */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl lg:text-4xl font-medium text-charcoal leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-charcoal">
                  {formatPrice(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted-text line-through">
                    {formatPrice(product.base_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-text leading-relaxed">{product.description}</p>
            )}

            {/* Variant selectors — only shown when variants exist */}
            {activeVariants.length > 0 ? (
              <div className="space-y-5">

                {/* Size selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                      Size
                      {selectedSize && (
                        <span className="ml-2 font-normal normal-case text-muted-olive">
                          {selectedSize}
                        </span>
                      )}
                    </span>
                    <button className="text-xs text-muted-text hover:text-charcoal underline underline-offset-2 transition-colors">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map(({ size }) => {
                      const sizeVariants = getColorsForSize(activeVariants, size);
                      const anyInStock = sizeVariants.some(
                        (v) => (v.inventory?.quantity ?? 0) > 0
                      );
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!anyInStock}
                          className={cn(
                            'min-w-[2.75rem] h-10 px-3 text-xs font-medium border rounded-xs transition-all',
                            selectedSize === size
                              ? 'border-charcoal bg-charcoal text-white'
                              : anyInStock
                                ? 'border-soft-beige text-charcoal hover:border-charcoal bg-white'
                                : 'border-soft-beige text-muted-text/50 bg-soft-beige/30 cursor-not-allowed line-through'
                          )}
                          aria-pressed={selectedSize === size}
                          aria-label={`Size ${size}${!anyInStock ? ', out of stock' : ''}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color selector */}
                {colorsForSelectedSize.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                      Color
                      {selectedColor && (
                        <span className="ml-2 font-normal normal-case text-muted-olive">
                          {selectedColor}
                        </span>
                      )}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colorsForSelectedSize.map((v) => {
                        const inStock = (v.inventory?.quantity ?? 0) > 0;
                        const isSelected = selectedColor === v.color_name;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedColor(v.color_name)}
                            disabled={!inStock}
                            title={v.color_name}
                            className={cn(
                              'w-9 h-9 rounded-full border-2 transition-all relative',
                              isSelected ? 'border-charcoal scale-110' : 'border-transparent hover:border-muted-text',
                              !inStock && 'opacity-30 cursor-not-allowed'
                            )}
                            style={{ backgroundColor: v.color_hex }}
                            aria-pressed={isSelected}
                            aria-label={`${v.color_name}${!inStock ? ', out of stock' : ''}`}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Check
                                  className="w-4 h-4"
                                  style={{
                                    color: isLightColor(v.color_hex) ? '#191A17' : '#ffffff',
                                  }}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock status */}
                {selectedVariant && (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        stockLevel === 'in' && 'bg-status-success',
                        stockLevel === 'low' && 'bg-status-warning',
                        stockLevel === 'out' && 'bg-status-error'
                      )}
                    />
                    <span className="text-xs text-muted-text">
                      {stockLevel === 'in' && 'In stock'}
                      {stockLevel === 'low' && `Only ${selectedVariant.inventory?.quantity} left`}
                      {stockLevel === 'out' && 'Out of stock'}
                    </span>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                    Quantity
                  </span>
                  <div className="flex items-center border border-soft-beige rounded-xs w-32 overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-soft-beige/50 transition-colors text-lg leading-none"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-medium text-charcoal">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-soft-beige/50 transition-colors text-lg leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-soft-beige/40 border border-soft-beige rounded-xs text-sm text-muted-text">
                No size or color variants have been added yet.
              </div>
            )}

            {/* Add to cart + Wishlist */}
            <div className="flex gap-3 pt-1">
              <Button
                variant={addedToCart ? 'olive' : 'primary'}
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={activeVariants.length > 0 && (!selectedVariant || stockLevel === 'out')}
                icon={addedToCart ? Check : ShoppingBag}
                iconPosition="left"
              >
                {addedToCart ? 'Added to Cart' : stockLevel === 'out' ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                className={cn(
                  'w-14 h-14 rounded-xs border flex items-center justify-center transition-colors flex-shrink-0',
                  wishlisted
                    ? 'bg-charcoal border-charcoal text-white'
                    : 'border-soft-beige text-charcoal hover:border-charcoal bg-white'
                )}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={wishlisted}
              >
                <Heart className={cn('w-5 h-5', wishlisted && 'fill-current')} />
              </motion.button>
            </div>

            {/* Delivery accordion */}
            <div className="border-t border-soft-beige pt-6 space-y-0">
              {DELIVERY_ACCORDION.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  open={openAccordion === item.id}
                  onToggle={() =>
                    setOpenAccordion((prev) => (prev === item.id ? null : item.id))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <section className="mt-24 space-y-10">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">
                  You May Also Like
                </span>
                <h2 className="font-serif text-2xl lg:text-3xl font-medium text-charcoal">
                  Related Products
                </h2>
              </div>
              <Link
                to="/shop"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider-brand text-charcoal hover:text-muted-olive transition-colors"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ProductGrid
              products={relatedProducts}
              loading={relatedLoading}
              skeletonCount={4}
              className="grid-cols-2 lg:grid-cols-4"
            />
          </section>
        )}
      </div>
    </div>
  );
};

// ─── Utility — determine if a hex color is light (for check icon contrast) ────
function isLightColor(hex) {
  if (!hex) return true;
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default ProductDetailPage;

