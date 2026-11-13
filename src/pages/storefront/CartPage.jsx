import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Trash2, Minus, Plus, ArrowRight, ArrowLeft,
  Truck, Shield, RefreshCw, Tag, Check, AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatters';
import { buildImageUrl } from '../../lib/imagekit';

export const CartPage = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const toast = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    // Demo promo validation
    if (promoCode.trim().toUpperCase() === 'HILAARA10') {
      setPromoApplied(true);
      setPromoError('');
      toast.success('Promotional code applied: 10% discount on order!');
    } else {
      setPromoError('Invalid or expired promotional code.');
      setPromoApplied(false);
    }
  };

  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="bg-warm-ivory min-h-[75vh] flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-soft-beige/70 border border-soft-beige flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-muted-text" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Your Bag</span>
            <h1 className="font-serif text-3xl font-medium text-charcoal">Your cart is currently empty</h1>
            <p className="text-sm text-muted-text leading-relaxed">
              Explore our curated collections of refined contemporary clothing crafted for Somalia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full" icon={ArrowRight} iconPosition="right">
                Explore All Products
              </Button>
            </Link>
            <Link to="/collections/new-arrivals" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                View New Arrivals
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-soft-beige pb-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">
              Shopping Bag
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
              Review Your Cart
            </h1>
          </div>
          <p className="text-sm text-muted-text">
            {totalItems} {totalItems === 1 ? 'garment' : 'garments'} selected
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-soft-beige rounded-xs overflow-hidden shadow-soft">
              {/* Table Header (Desktop) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-soft-beige/30 border-b border-soft-beige text-xs font-semibold uppercase tracking-wider-brand text-muted-text">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-soft-beige">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="p-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="sm:col-span-6 flex gap-4">
                          <Link
                            to={`/products/${item.slug}`}
                            className="shrink-0 w-20 h-26 sm:w-24 sm:h-32 rounded-xs overflow-hidden bg-soft-beige/50 border border-soft-beige"
                          >
                            {item.image ? (
                              <img
                                src={buildImageUrl(item.image, { width: 192, height: 256, quality: 85 })}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-text">
                                <ShoppingBag className="w-6 h-6 opacity-40" />
                              </div>
                            )}
                          </Link>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <Link
                              to={`/products/${item.slug}`}
                              className="font-medium text-charcoal text-base hover:text-muted-olive transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-text">
                              <span>Size: <strong className="text-charcoal font-medium">{item.size}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1.5">
                                Color:
                                <span
                                  className="w-3 h-3 rounded-full border border-soft-beige inline-block"
                                  style={{ backgroundColor: item.colorHex }}
                                  title={item.colorName}
                                />
                                <strong className="text-charcoal font-medium">{item.colorName}</strong>
                              </span>
                            </div>

                            {item.sku && (
                              <p className="text-[11px] text-muted-text font-mono">
                                SKU: {item.sku}
                              </p>
                            )}

                            <p className="text-xs text-charcoal font-medium sm:hidden pt-1">
                              Unit: {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="sm:col-span-3 flex sm:justify-center items-center gap-3">
                          <div className="flex items-center border border-soft-beige rounded-xs bg-white">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-soft-beige/60 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-charcoal select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-soft-beige/60 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              removeItem(item.variantId);
                              toast.info(`Removed ${item.name} from cart.`);
                            }}
                            className="p-1.5 text-muted-text hover:text-status-error transition-colors sm:hidden"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price & Remove (Desktop) */}
                        <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-4 text-right">
                          <div>
                            <span className="block text-base font-semibold text-charcoal">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <span className="hidden sm:block text-xs text-muted-text">
                              {formatPrice(item.price)} each
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              removeItem(item.variantId);
                              toast.info(`Removed ${item.name} from cart.`);
                            }}
                            className="hidden sm:inline-flex p-1.5 text-muted-text hover:text-status-error transition-colors"
                            aria-label={`Remove ${item.name}`}
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {/* Cart Table Footer Actions */}
              <div className="px-6 py-4 bg-warm-ivory/50 border-t border-soft-beige flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider-brand text-charcoal hover:text-muted-olive transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                      toast.info('Cart cleared.');
                    }
                  }}
                  className="text-xs text-muted-text hover:text-status-error transition-colors underline underline-offset-2"
                >
                  Clear Entire Cart
                </button>
              </div>
            </div>

            {/* Shopping Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 bg-white border border-soft-beige rounded-xs">
                <Truck className="w-5 h-5 text-muted-olive shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                    Nationwide Dispatch
                  </h4>
                  <p className="text-xs text-muted-text">
                    Courier delivery across Mogadishu, Hargeisa, Garowe and beyond.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-soft-beige rounded-xs">
                <Shield className="w-5 h-5 text-muted-olive shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                    Verified Quality
                  </h4>
                  <p className="text-xs text-muted-text">
                    All fabrics and garments inspected before fulfillment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-soft-beige rounded-xs">
                <RefreshCw className="w-5 h-5 text-muted-olive shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                    14-Day Exchanges
                  </h4>
                  <p className="text-xs text-muted-text">
                    Convenient size and color exchanges if unworn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white border border-soft-beige rounded-xs p-6 shadow-soft space-y-6">
              <h2 className="font-serif text-xl font-medium text-charcoal border-b border-soft-beige pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-charcoal">
                  <span className="text-muted-text">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center text-status-success">
                    <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider-brand">
                      <Tag className="w-3.5 h-3.5" />
                      Promo (HILAARA10 -10%)
                    </span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-start text-charcoal pt-1">
                  <div>
                    <span className="text-muted-text">Estimated Shipping</span>
                    <p className="text-[11px] text-muted-text/80">Calculated at checkout</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider-brand text-muted-olive">
                    Selected at Next Step
                  </span>
                </div>

                <div className="border-t border-soft-beige pt-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-semibold text-charcoal">Estimated Total</span>
                    <p className="text-[11px] text-muted-text">Includes applicable taxes</p>
                  </div>
                  <span className="font-serif text-2xl font-semibold text-charcoal">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="border-t border-soft-beige pt-4 space-y-2">
                <label htmlFor="promo" className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal block">
                  Promotional Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo"
                    type="text"
                    placeholder="Enter code (try HILAARA10)"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError('');
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-warm-ivory border border-soft-beige rounded-xs uppercase tracking-wider-brand placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-charcoal"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-status-success flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> 10% promotional discount applied.
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-status-error flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {promoError}
                  </p>
                )}
              </form>

              {/* Proceed to Checkout CTA */}
              <div className="space-y-3 pt-2">
                <Link to="/checkout" className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-[11px] text-center text-muted-text leading-relaxed">
                  Tax, exact shipping fees, and customer delivery address will be finalized during checkout.
                </p>
              </div>

              {/* Supported Somali Payment Methods */}
              <div className="border-t border-soft-beige pt-4 text-center space-y-2.5">
                <span className="text-[11px] uppercase tracking-widest-brand text-muted-text block">
                  Accepted Mobile Money & Payment Methods
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-charcoal">
                  <span className="px-2 py-1 bg-soft-beige/50 rounded-xs border border-soft-beige">EVC Plus</span>
                  <span className="px-2 py-1 bg-soft-beige/50 rounded-xs border border-soft-beige">eDahab</span>
                  <span className="px-2 py-1 bg-soft-beige/50 rounded-xs border border-soft-beige">ZAAD</span>
                  <span className="px-2 py-1 bg-soft-beige/50 rounded-xs border border-soft-beige">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

