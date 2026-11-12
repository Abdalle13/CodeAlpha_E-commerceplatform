import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';

// Collection slug -> display configuration
const COLLECTION_CONFIG = {
  men: {
    title: "Men's Collection",
    subtitle: 'Tailored and refined essentials for the modern man.',
    filter: (query) => query.eq('gender', 'men'),
  },
  women: {
    title: "Women's Collection",
    subtitle: 'Contemporary silhouettes and textures for every occasion.',
    filter: (query) => query.eq('gender', 'women'),
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'The latest additions to the HILAARA catalog.',
    filter: (query) => query.eq('is_new_arrival', true),
  },
  featured: {
    title: 'Featured Pieces',
    subtitle: 'Handpicked selections from the current season.',
    filter: (query) => query.eq('is_featured', true),
  },
  sale: {
    title: 'Sale',
    subtitle: 'Selected pieces at reduced prices. While stocks last.',
    filter: (query) => query.not('discount_price', 'is', null),
  },
};

const PRODUCT_SELECT = `
  id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival,
  images:product_images(imagekit_url, is_primary, display_order),
  category:categories(name, slug)
`;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const CollectionPage = () => {
  const { slug } = useParams();
  const config = COLLECTION_CONFIG[slug];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(PRODUCT_SELECT, { count: 'exact' })
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        query = config.filter(query);

        const { data, count } = await query;
        setProducts(data || []);
        setTotalCount(count || 0);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  // Unknown collection slug
  if (!config) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <h1 className="font-serif text-4xl font-medium text-charcoal">Collection not found</h1>
        <p className="text-muted-text text-sm">
          The collection you are looking for does not exist or has been removed.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="md">Browse All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory min-h-screen">
      {/* Page Header */}
      <section className="bg-soft-beige/40 border-b border-soft-beige py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-text mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-charcoal font-medium">{config.title}</span>
          </nav>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
            <span className="inline-block text-xs uppercase tracking-widest-brand text-muted-olive font-medium">
              Collection
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl font-medium text-charcoal">
              {config.title}
            </h1>
            <p className="text-muted-text text-base max-w-lg">{config.subtitle}</p>
            {!loading && totalCount > 0 && (
              <p className="text-xs text-muted-text/70 pt-1">
                {totalCount} {totalCount === 1 ? 'piece' : 'pieces'}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        {!loading && products.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center py-24 space-y-5 border border-dashed border-soft-beige rounded-xs"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-text">No products in this collection yet.</p>
              <p className="text-xs text-muted-text/70">
                Products will appear here once added via the Admin Console.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/shop">
                <Button variant="primary" size="sm">Browse All Products</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">Back to Home</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={8} />
        )}
      </section>
    </div>
  );
};

export default CollectionPage;

