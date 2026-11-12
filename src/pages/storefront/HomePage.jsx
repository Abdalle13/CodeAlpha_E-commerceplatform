import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, CreditCard, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';

// ─── Fade-in-up animation variant ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ─── Benefits data ────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    desc: 'Fast courier fulfillment to Mogadishu, Hargeisa, Garowe, Kismayo and beyond.',
  },
  {
    icon: CreditCard,
    title: 'Mobile Money Payments',
    desc: 'Pay securely via EVC Plus, eDahab, or ZAAD. No bank account required.',
  },
  {
    icon: Shield,
    title: 'Genuine Products',
    desc: 'Every garment in the HILAARA catalog is verified for quality and authenticity.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    desc: 'Straightforward returns policy so you can shop with complete confidence.',
  },
];

// ─── Empty state hero — renders when no products exist yet ────────────────────
const EmptyHero = () => (
  <section className="relative bg-charcoal overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40 flex flex-col lg:flex-row items-center gap-12">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-white max-w-xl space-y-7 text-center lg:text-left"
      >
        <span className="inline-block text-xs uppercase tracking-widest-brand text-soft-beige/60 font-medium">
          Modern Fashion for Somalia
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
          Dressed for the
          <br />
          <span className="italic font-medium">modern era.</span>
        </h1>
        <p className="text-soft-beige/70 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
          Refined men's and women's fashion, designed for confident, contemporary style across Somalia.
        </p>
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          <Link to="/collections/women">
            <Button variant="white" size="lg" icon={ArrowRight} iconPosition="right">
              Women's Collection
            </Button>
          </Link>
          <Link to="/collections/men">
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/60">
              Men's Collection
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Decorative geometric element when no photography available */}
      <div className="hidden lg:block flex-1 relative h-96" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-80 border border-white/10 rounded-xs" />
            <div className="absolute -top-4 -right-4 w-64 h-80 border border-white/5 rounded-xs" />
            <div className="absolute top-8 left-8 right-8 bottom-8 flex flex-col items-center justify-center space-y-3 text-white/20">
              <img src="/brand/hilaara-mark-light.svg" alt="" className="w-16 h-16 opacity-30" />
              <p className="text-xs uppercase tracking-widest-brand opacity-50">HILAARA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Collection Gateway cards ─────────────────────────────────────────────────
const CollectionGateway = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="text-center mb-12 space-y-2"
    >
      <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Explore</span>
      <h2 className="font-serif text-3xl lg:text-4xl font-medium text-charcoal">Shop by Collection</h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        {
          label: "Men's Collection",
          sub: "Tailored and refined essentials.",
          href: '/collections/men',
          accent: '#191A17',
        },
        {
          label: "Women's Collection",
          sub: "Contemporary silhouettes and textures.",
          href: '/collections/women',
          accent: '#777B62',
        },
      ].map((col) => (
        <motion.div
          key={col.href}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <Link
            to={col.href}
            className="group relative flex flex-col justify-end overflow-hidden rounded-xs"
            style={{ minHeight: '380px' }}
          >
            {/* Background */}
            <div
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundColor: col.accent, opacity: 0.08 }}
            />
            <div className="absolute inset-0 bg-soft-beige" />
            {/* Placeholder visual */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10" aria-hidden="true">
              <span className="font-serif text-9xl font-medium text-charcoal select-none">
                {col.label[0]}
              </span>
            </div>

            {/* Content Overlay */}
            <div className="relative p-8 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent">
              <span className="text-xs uppercase tracking-wider-brand text-white/70 font-medium">Collection</span>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium text-white mt-1">{col.label}</h3>
              <p className="text-sm text-white/70 mt-1">{col.sub}</p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold uppercase tracking-wider-brand text-white group-hover:gap-3 transition-all">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

// ─── Benefits strip ───────────────────────────────────────────────────────────
const BenefitsStrip = () => (
  <section className="bg-soft-beige/40 border-y border-soft-beige py-14">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className="w-11 h-11 rounded-full bg-charcoal/8 border border-charcoal/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-olive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
              <p className="text-xs text-muted-text leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Main Homepage Component ──────────────────────────────────────────────────
export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoadingFeatured(false);
      setLoadingNew(false);
      return;
    }

    const fetchFeatured = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select(`
            id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival,
            images:product_images(imagekit_url, is_primary, display_order),
            category:categories(name, slug)
          `)
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8);
        setFeaturedProducts(data || []);
      } finally {
        setLoadingFeatured(false);
      }
    };

    const fetchNew = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select(`
            id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival,
            images:product_images(imagekit_url, is_primary, display_order),
            category:categories(name, slug)
          `)
          .eq('is_published', true)
          .eq('is_new_arrival', true)
          .order('created_at', { ascending: false })
          .limit(8);
        setNewArrivals(data || []);
      } finally {
        setLoadingNew(false);
      }
    };

    fetchFeatured();
    fetchNew();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="bg-warm-ivory">
      {/* Hero */}
      <EmptyHero />

      {/* Collection Gateways */}
      <CollectionGateway />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex items-end justify-between mb-10"
        >
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Handpicked</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-charcoal">Featured Pieces</h2>
          </div>
          <Link to="/collections/featured" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider-brand text-charcoal hover:text-muted-olive transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {!loadingFeatured && featuredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3 border border-dashed border-soft-beige rounded-xs">
            <p className="text-sm font-medium text-muted-text">No featured products yet.</p>
            <p className="text-xs text-muted-text/70">Add products in the Admin Console and mark them as featured.</p>
          </div>
        ) : (
          <ProductGrid products={featuredProducts} loading={loadingFeatured} skeletonCount={4} />
        )}
      </section>

      {/* Benefits */}
      <BenefitsStrip />

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex items-end justify-between mb-10"
        >
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Just In</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-charcoal">New Arrivals</h2>
          </div>
          <Link to="/collections/new-arrivals" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider-brand text-charcoal hover:text-muted-olive transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {!loadingNew && newArrivals.length === 0 ? (
          <div className="text-center py-16 space-y-3 border border-dashed border-soft-beige rounded-xs">
            <p className="text-sm font-medium text-muted-text">No new arrivals yet.</p>
            <p className="text-xs text-muted-text/70">Add products to begin building your catalog.</p>
          </div>
        ) : (
          <ProductGrid products={newArrivals} loading={loadingNew} skeletonCount={4} />
        )}
      </section>

      {/* Brand Story */}
      <section className="bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-2xl mx-auto text-center space-y-6"
          >
            <img src="/brand/hilaara-mark-light.svg" alt="HILAARA" className="h-12 w-auto mx-auto opacity-80" />
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-white leading-tight">
              Fashion with intention.
              <br />
              <span className="italic font-medium">Made for Somalia.</span>
            </h2>
            <p className="text-soft-beige/70 text-sm sm:text-base leading-relaxed">
              HILAARA brings a refined, contemporary wardrobe to Somalia. Every garment is chosen for quality, versatility, and enduring style. No shortcuts. No excess. Just clothing made to be worn.
            </p>
            <div className="pt-2">
              <Link to="/shop">
                <Button variant="white" size="md" icon={ArrowRight} iconPosition="right">
                  Explore the Full Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="bg-soft-beige/50 border border-soft-beige rounded-xs px-6 py-12 text-center max-w-2xl mx-auto space-y-5"
        >
          <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Stay Updated</span>
          <h2 className="font-serif text-2xl lg:text-3xl font-medium text-charcoal">
            New arrivals and exclusive updates
          </h2>
          <p className="text-sm text-muted-text">
            Enter your email to receive early access to new collections and curated seasonal selections.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-sm text-status-success font-medium py-2">
              <span>You are subscribed. Thank you.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-soft-beige rounded-xs focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal placeholder:text-muted-text/60"
                aria-label="Email address for newsletter"
              />
              <Button type="submit" variant="primary" size="md">
                Subscribe
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-text/70">We respect your privacy. Unsubscribe at any time.</p>
        </motion.div>
      </section>
    </div>
  );
};

