import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

export const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);

  // Could be fetched from store_settings in production
  const announcements = [
    'Complimentary same-day delivery across Mogadishu for orders over $100.',
    'Pay with EVC Plus, eDahab, or ZAAD at checkout.',
    'New arrivals added weekly — explore the latest looks.',
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, announcements.length]);

  if (!visible) return null;

  return (
    <div className="bg-charcoal text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xs tracking-wider text-center text-soft-beige/90 pr-6"
          >
            {announcements[index]}
          </motion.p>
        </AnimatePresence>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 text-soft-beige/60 hover:text-white transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

