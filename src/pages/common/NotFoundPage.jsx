import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage = () => (
  <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center max-w-md space-y-8"
    >
      {/* Brand mark */}
      <img
        src="/brand/hilaara-mark-dark.svg"
        alt="HILAARA"
        className="h-10 w-auto mx-auto opacity-30"
      />

      {/* Error code */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Page Not Found</p>
        <h1 className="font-serif text-6xl sm:text-7xl font-light text-charcoal tracking-tight">404</h1>
        <p className="text-muted-text text-sm leading-relaxed">
          The page you are looking for does not exist, may have been moved, or is temporarily unavailable.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={ArrowLeft} iconPosition="left">
            Back to Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="md">Browse Products</Button>
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;

