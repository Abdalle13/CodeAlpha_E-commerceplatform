/**
 * productService.js
 * Reusable Supabase product query helpers for HILAARA Store.
 * All public queries operate on published products only.
 * Admin queries are gated separately via RLS (is_admin()).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Shared select fragments ───────────────────────────────────────────────────

const PRODUCT_CARD_SELECT = `
  id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival, created_at,
  images:product_images(imagekit_url, is_primary, display_order),
  category:categories(name, slug)
`;

const PRODUCT_DETAIL_SELECT = `
  id, name, slug, description, gender, base_price, discount_price,
  is_featured, is_new_arrival, is_published, created_at, updated_at,
  images:product_images(id, imagekit_url, imagekit_path, alt_text, is_primary, display_order),
  category:categories(id, name, slug, gender),
  variants:product_variants(
    id, sku, size, color_name, color_hex, price_override, is_active,
    inventory(quantity, low_stock_threshold)
  )
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function notConfigured() {
  return { data: null, error: new Error('Supabase not configured') };
}

// ─── Public storefront queries ─────────────────────────────────────────────────

/**
 * Fetch a single product by slug for the PDP.
 * Returns the product with all images, variants, and inventory.
 */
export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  return { data, error };
}

/**
 * Fetch a product by slug for admin (includes unpublished).
 */
export async function getProductBySlugAdmin(slug) {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  return { data, error };
}

/**
 * Fetch related products — same gender and/or category, excluding the current product.
 * Returns up to `limit` results.
 */
export async function getRelatedProducts(productId, { gender, categoryId, limit = 4 } = {}) {
  if (!isSupabaseConfigured) return { data: [], error: null };

  let query = supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .eq('is_published', true)
    .neq('id', productId)
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  } else if (gender) {
    query = query.eq('gender', gender);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Fetch featured products for homepage or sections.
 */
export async function getFeaturedProducts(limit = 8) {
  if (!isSupabaseConfigured) return { data: [], error: null };

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Fetch new arrivals for homepage or sections.
 */
export async function getNewArrivals(limit = 8) {
  if (!isSupabaseConfigured) return { data: [], error: null };

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .eq('is_published', true)
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Paginated product list with dynamic filter + sort.
 * Accepts a filter object and returns { data, count, error }.
 */
export async function getProducts({
  gender = null,
  categoryId = null,
  search = null,
  onSale = false,
  inStock = false,
  sortBy = 'newest',
  page = 1,
  pageSize = 24,
} = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0, error: null };

  let query = supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT, { count: 'exact' })
    .eq('is_published', true);

  if (gender) query = query.eq('gender', gender);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) query = query.ilike('name', `%${search}%`);
  if (onSale) query = query.not('discount_price', 'is', null);

  switch (sortBy) {
    case 'price-asc':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('base_price', { ascending: false });
      break;
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data || [], count: count || 0, error };
}

/**
 * Fetch all categories (active only for storefront).
 */
export async function getCategories({ adminMode = false } = {}) {
  if (!isSupabaseConfigured) return { data: [], error: null };

  let query = supabase
    .from('categories')
    .select('id, name, slug, gender, description, display_order, is_active')
    .order('display_order', { ascending: true });

  if (!adminMode) query = query.eq('is_active', true);

  const { data, error } = await query;
  return { data: data || [], error };
}

