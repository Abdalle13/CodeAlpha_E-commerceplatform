import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { formatPrice } from '../../utils/formatters';
import { buildImageUrl, IMAGE_PRESETS } from '../../lib/imagekit';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-warm-ivory z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-soft-beige bg-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-charcoal" />
                <h2 className="font-serif text-xl font-medium text-charcoal">
                  Your Cart
                </h2>
                {totalItems > 0 && (
                  <span className="text-xs text-muted-text">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-text hover:text-charcoal transition-colors rounded-xs"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-16">
                  <div className="w-16 h-16 rounded-full bg-soft-beige flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-muted-text" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-serif text-lg text-charcoal">Your cart is empty</p>
                    <p className="text-sm text-muted-text">Add garments to your cart to begin.</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={onClose} asChild>
                    <Link to="/shop" onClick={onClose}>Browse Collections</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 bg-white border border-soft-beige rounded-xs p-3"
                      >
                        {/* Image */}
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={onClose}
                          className="shrink-0 w-20 h-26 overflow-hidden rounded-xs bg-soft-beige"
                          style={{ width: '80px', height: '104px' }}
                        >
                          {item.image ? (
                            <img
                              src={buildImageUrl(item.image, { width: 160, height: 208, quality: 80 })}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-soft-beige" />
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/products/${item.slug}`}
                              onClick={onClose}
                              className="text-sm font-medium text-charcoal hover:underline line-clamp-2 leading-snug"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="shrink-0 p-1 text-muted-text hover:text-status-error transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-text">
                            <span>{item.size}</span>
                            <span>/</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-3 h-3 rounded-full border border-soft-beige inline-block"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              {item.colorName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {/* Quantity */}
                            <div className="flex items-center gap-1 border border-soft-beige rounded-xs">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-charcoal hover:bg-soft-beige/60 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-medium text-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-charcoal hover:bg-soft-beige/60 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-charcoal">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-soft-beige bg-white px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-text">Subtotal</span>
                  <span className="text-base font-semibold text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-text">Delivery fee calculated at checkout based on your location.</p>
                <div className="space-y-2">
                  <Link to="/checkout" onClick={onClose}>
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
                  <Link to="/cart" onClick={onClose}>
                    <Button variant="outline" size="md" className="w-full">
                      View Full Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

