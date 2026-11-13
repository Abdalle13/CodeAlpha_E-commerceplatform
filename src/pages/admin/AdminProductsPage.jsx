import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Check, X,
  Package, Filter, Eye, AlertCircle, RefreshCw, Layers,
} from 'lucide-react';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/adminService';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    gender: 'women',
    category: "Women's Dirac & Caftans",
    base_price: 85,
    discount_price: '',
    is_published: true,
    is_featured: false,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  });

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await getAdminProducts({
      search,
      gender: genderFilter,
      status: statusFilter,
    });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [genderFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      gender: 'women',
      category: "Women's Dirac & Caftans",
      base_price: 85,
      discount_price: '',
      is_published: true,
      is_featured: false,
      is_new_arrival: true,
      primary_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      slug: prod.slug || '',
      description: prod.description || '',
      gender: prod.gender || 'women',
      category: prod.category || prod.categories?.name || "Women's Dirac & Caftans",
      base_price: prod.base_price || prod.price || 0,
      discount_price: prod.discount_price || '',
      is_published: prod.is_published !== false,
      is_featured: prod.is_featured || false,
      is_new_arrival: prod.is_new_arrival || false,
      primary_image: prod.images?.[0] || prod.primary_image || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product title is required.');
      return;
    }

    setSaving(true);
    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      ...formData,
      slug,
      images: [formData.primary_image],
      base_price: Number(formData.base_price),
      discount_price: formData.discount_price ? Number(formData.discount_price) : null,
    };

    if (editingProduct) {
      const { data, error } = await updateProduct(editingProduct.id, payload);
      if (!error) {
        toast.success(`Product "${formData.name}" updated successfully.`);
        setIsModalOpen(false);
        loadProducts();
      } else {
        toast.error(error.message || 'Update failed');
      }
    } else {
      const { data, error } = await createProduct(payload);
      if (!error) {
        toast.success(`Product "${formData.name}" added to catalog.`);
        setIsModalOpen(false);
        loadProducts();
      } else {
        toast.error(error.message || 'Creation failed');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (prod) => {
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from published catalog?`)) {
      await deleteProduct(prod.id);
      toast.info(`Product "${prod.name}" removed.`);
      loadProducts();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Product Management</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Add, update, and manage men’s and women’s fashion styles and variants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadProducts}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add New Style</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-soft-beige rounded-xs p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs focus:outline-none focus:border-charcoal"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="women">Women's Fashion</option>
            <option value="men">Men's Fashion</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft / Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-soft-beige rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-text">
            <div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-text space-y-2">
            <Package className="w-8 h-8 mx-auto text-muted-text/50" />
            <p className="font-medium text-charcoal">No products match your criteria</p>
            <p className="text-[11px]">Adjust your search filters or click "Add New Style" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-ivory border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">Style</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Gender</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige">
                {products.map((prod) => {
                  const img = prod.images?.[0] || prod.primary_image || '/placeholder.svg';
                  return (
                    <tr key={prod.id} className="hover:bg-warm-ivory/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={prod.name}
                            className="w-10 h-12 object-cover rounded-xs border border-soft-beige bg-soft-beige/30"
                          />
                          <div>
                            <span className="font-semibold text-charcoal block">{prod.name}</span>
                            <span className="font-mono text-[10px] text-muted-text">{prod.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-text">
                        {prod.category || prod.categories?.name || 'General Fashion'}
                      </td>
                      <td className="py-3 px-4 capitalize text-charcoal font-medium">
                        {prod.gender}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal">{formatPrice(prod.base_price || prod.price)}</span>
                        {prod.discount_price && (
                          <span className="block text-[10px] text-rose-700 line-through">
                            {formatPrice(prod.discount_price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={prod.is_published !== false ? 'olive' : 'charcoal'}
                          size="xs"
                        >
                          {prod.is_published !== false ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-xs hover:bg-soft-beige text-charcoal transition"
                          title="Edit Style"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 rounded-xs hover:bg-red-50 text-red-600 transition"
                          title="Delete / Archive Style"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-soft-beige rounded-xs shadow-xl max-w-xl w-full p-6 space-y-5 my-8 text-charcoal"
            >
              <div className="flex items-center justify-between pb-3 border-b border-soft-beige">
                <h2 className="font-serif text-lg font-semibold text-charcoal">
                  {editingProduct ? 'Edit Fashion Style' : 'Add New Fashion Style'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-muted-text hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Traditional Somali Dirac"
                    className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs"
                    >
                      <option value="women">Women's Fashion</option>
                      <option value="men">Men's Fashion</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Dirac & Caftans"
                      className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Base Price (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Discount Price (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      placeholder="e.g. 75.00"
                      className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Image URL (ImageKit / Unsplash CDN)</label>
                  <input
                    type="url"
                    value={formData.primary_image}
                    onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                    className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
                  />
                  {formData.primary_image && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={formData.primary_image}
                        alt="Preview"
                        className="w-12 h-14 object-cover rounded-xs border border-soft-beige"
                      />
                      <span className="text-[11px] text-muted-text">Image preview verified</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Editorial product details, fabric, sizing notes..."
                    className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
                  />
                </div>

                {/* Flags Checkboxes */}
                <div className="pt-2 border-t border-soft-beige flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Published</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Featured on Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_new_arrival}
                      onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-soft-beige flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Style'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsPage;
