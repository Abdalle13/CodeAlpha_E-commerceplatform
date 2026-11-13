import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';

export const WishlistPage = () => {
  const { wishlist, count } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (count === 0 || !isSupabaseConfigured) {
      setProducts([]);
      return;
    }

    setLoading(true);
    supabase
      .from('products')
      .select(`
        id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival,
        images:product_images(imagekit_url, is_primary, display_order),
        category:categories(name, slug)
      `)
      .in('id', wishlist)
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, [wishlist, count]);

  if (count === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-soft-beige/70 flex items-center justify-center mx-auto text-muted-text">
          <Heart className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-medium text-charcoal">Your Wishlist is Empty</h2>
          <p className="text-sm text-muted-text">Save your favorite pieces to review and order anytime.</p>
        </div>
        <Link to="/shop">
          <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
            Discover Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-soft-beige pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-charcoal">Saved Wishlist</h2>
          <p className="text-xs text-muted-text mt-1">Curated pieces you have bookmarked for future purchase.</p>
        </div>
        <span className="text-xs text-muted-text">{count} {count === 1 ? 'piece' : 'pieces'}</span>
      </div>

      <ProductGrid products={products} loading={loading} skeletonCount={4} />
    </div>
  );
};

export default WishlistPage;

