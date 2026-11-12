import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 24;

const GENDER_OPTIONS = [
  { value: 'men', label: "Men" },
  { value: 'women', label: "Women" },
  { value: 'unisex', label: "Unisex" },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

const PRODUCT_SELECT = `
  id, name, slug, gender, base_price, discount_price, is_featured, is_new_arrival,
  images:product_images(imagekit_url, is_primary, display_order),
  category:categories(name, slug)
`;

// Collapsible filter section
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-soft-beige py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-charcoal uppercase tracking-wider-brand"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted-text" /> : <ChevronDown className="w-4 h-4 text-muted-text" />}
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
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Checkbox option row
const CheckboxOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group py-1">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 rounded-none accent-charcoal cursor-pointer"
    />
    <span className="text-sm text-charcoal group-hover:text-muted-olive transition-colors">{label}</span>
  </label>
);

// Active filter chip
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-charcoal text-white text-xs font-medium px-2.5 py-1 rounded-xs">
    {label}
    <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-soft-beige transition-colors">
      <X className="w-3 h-3" />
    </button>
  </span>
);

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Derived filter state from URL search params
  const searchQuery = searchParams.get('q') || '';
  const selectedGenders = searchParams.getAll('gender');
  const selectedCategories = searchParams.getAll('category');
  const inStock = searchParams.get('inStock') === 'true';
  const onSale = searchParams.get('sale') === 'true';
  const sortBy = searchParams.get('sort') || 'newest';

  // Local search input state (debounced before writing to URL)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchTimer = useRef(null);

  // Fetch categories once
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async (resetPage = true) => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    try {
      let query = supabase
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .eq('is_published', true);

      // Search
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      // Gender
      if (selectedGenders.length === 1) {
        query = query.eq('gender', selectedGenders[0]);
      } else if (selectedGenders.length > 1) {
        query = query.in('gender', selectedGenders);
      }
      // Category
      if (selectedCategories.length > 0) {
        // Filter by category slug via join — categories have slugs
        query = query.in('category_id',
          categories
            .filter((c) => selectedCategories.includes(c.slug))
            .map((c) => c.id)
        );
      }
      // Sale filter
      if (onSale) {
        query = query.not('discount_price', 'is', null);
      }

      // Sorting
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

      // Pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count } = await query;

      if (resetPage) {
        setProducts(data || []);
      } else {
        setProducts((prev) => [...prev, ...(data || [])]);
      }
      setTotalCount(count || 0);
      setHasMore((count || 0) > currentPage * PAGE_SIZE);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenders.join(','), selectedCategories.join(','), inStock, onSale, sortBy, categories]);

  useEffect(() => {
    fetchProducts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenders.join(','), selectedCategories.join(','), inStock, onSale, sortBy]);

  // Debounced search input -> URL
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set('q', value);
      } else {
        next.delete('q');
      }
      setSearchParams(next, { replace: true });
    }, 400);
  };

  const toggleParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    const existing = next.getAll(key);
    if (existing.includes(value)) {
      next.delete(key);
      existing.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      next.append(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const setBoolParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, 'true');
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const setSort = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'newest') {
      next.delete('sort');
    } else {
      next.set('sort', value);
    }
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const activeFilterCount =
    selectedGenders.length + selectedCategories.length + (inStock ? 1 : 0) + (onSale ? 1 : 0) + (searchQuery ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-0">
      <FilterSection title="Gender">
        {GENDER_OPTIONS.map(({ value, label }) => (
          <CheckboxOption
            key={value}
            label={label}
            checked={selectedGenders.includes(value)}
            onChange={() => toggleParam('gender', value)}
          />
        ))}
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection title="Category">
          {categories.map((cat) => (
            <CheckboxOption
              key={cat.slug}
              label={cat.name}
              checked={selectedCategories.includes(cat.slug)}
              onChange={() => toggleParam('category', cat.slug)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Availability" defaultOpen={false}>
        <CheckboxOption
          label="In Stock Only"
          checked={inStock}
          onChange={() => setBoolParam('inStock', !inStock)}
        />
        <CheckboxOption
          label="On Sale"
          checked={onSale}
          onChange={() => setBoolParam('sale', !onSale)}
        />
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-warm-ivory min-h-screen">
      {/* Page Header */}
      <section className="bg-soft-beige/40 border-b border-soft-beige py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Catalog</span>
              <h1 className="font-serif text-3xl lg:text-4xl font-medium text-charcoal">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h1>
              {!loading && (
                <p className="text-xs text-muted-text/70">
                  {totalCount} {totalCount === 1 ? 'product' : 'products'}
                </p>
              )}
            </div>

            {/* Search + Sort row */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-text pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-soft-beige rounded-xs focus:outline-none focus:ring-1 focus:ring-charcoal focus:border-charcoal w-56 placeholder:text-muted-text/60"
                  aria-label="Search products"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm bg-white border border-soft-beige rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-charcoal text-charcoal cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-charcoal bg-white border border-soft-beige rounded-xs px-3 py-2 hover:border-charcoal transition-colors relative"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-charcoal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedGenders.map((g) => (
                <FilterChip key={g} label={g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'} onRemove={() => toggleParam('gender', g)} />
              ))}
              {selectedCategories.map((c) => {
                const cat = categories.find((x) => x.slug === c);
                return cat ? <FilterChip key={c} label={cat.name} onRemove={() => toggleParam('category', c)} /> : null;
              })}
              {inStock && <FilterChip label="In Stock" onRemove={() => setBoolParam('inStock', false)} />}
              {onSale && <FilterChip label="On Sale" onRemove={() => setBoolParam('sale', false)} />}
              {searchQuery && <FilterChip label={`"${searchQuery}"`} onRemove={resetFilters} />}
              <button
                onClick={resetFilters}
                className="text-xs text-muted-text hover:text-charcoal underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-2 pb-3 border-b border-soft-beige">
                <span className="text-xs font-semibold uppercase tracking-widest-brand text-charcoal">Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-muted-text hover:text-charcoal underline underline-offset-2 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {!loading && products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 space-y-5 border border-dashed border-soft-beige rounded-xs"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-text">No products match your filters.</p>
                  <p className="text-xs text-muted-text/70">
                    {activeFilterCount > 0
                      ? 'Try adjusting or clearing your active filters.'
                      : 'Products will appear here once added via the Admin Console.'}
                  </p>
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-10">
                <ProductGrid products={products} loading={loading} skeletonCount={PAGE_SIZE} />

                {!loading && hasMore && (
                  <div className="text-center pt-6">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setPage((p) => p + 1);
                        fetchProducts(false);
                      }}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-warm-ivory z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-soft-beige">
                <span className="text-sm font-semibold uppercase tracking-wider-brand text-charcoal">Filters</span>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 text-muted-text hover:text-charcoal transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel />
                <div className="pt-6 space-y-3">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => setFilterDrawerOpen(false)}
                  >
                    View {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
                  </Button>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      onClick={() => { resetFilters(); setFilterDrawerOpen(false); }}
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;

