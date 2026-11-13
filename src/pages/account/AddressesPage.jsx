import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const AddressesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Mogadishu',
    district: '',
    streetAddress: '',
    deliveryInstructions: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (!error && data) {
        setAddresses(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.city || !formData.district || !formData.streetAddress) {
      toast.error('Please complete all required address fields.');
      return;
    }

    setSaving(true);
    if (!isSupabaseConfigured) {
      // Local state fallback
      const newAddr = {
        id: `addr-${Date.now()}`,
        full_name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        street_address: formData.streetAddress,
        delivery_instructions: formData.deliveryInstructions,
        is_default: formData.isDefault,
      };
      setAddresses([newAddr, ...addresses]);
      setShowAddForm(false);
      setSaving(false);
      toast.success('Address saved.');
      return;
    }

    try {
      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        street_address: formData.streetAddress,
        delivery_instructions: formData.deliveryInstructions,
        is_default: formData.isDefault,
      });

      if (error) throw error;
      toast.success('Address saved successfully.');
      setShowAddForm(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-soft-beige pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-charcoal">Saved Delivery Addresses</h2>
          <p className="text-xs text-muted-text mt-1">Conveniently pre-fill your shipping destinations across Somalia.</p>
        </div>
        <Button
          variant={showAddForm ? 'outline' : 'primary'}
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={showAddForm ? undefined : Plus}
          iconPosition="left"
        >
          {showAddForm ? 'Cancel' : 'Add New Address'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="p-5 border border-soft-beige bg-warm-ivory/40 rounded-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal">New Address Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Name"
              required
              placeholder="e.g. Hassan Mohamed"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Contact Phone"
              required
              placeholder="e.g. +252 61 500 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City / State"
              required
              placeholder="e.g. Mogadishu / Hargeisa"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="District / Neighborhood"
              required
              placeholder="e.g. Hodan / Waberi"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>

          <Input
            label="Street Address / Landmark"
            required
            placeholder="e.g. Near KM4 Roundabout"
            value={formData.streetAddress}
            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="accent-charcoal cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs text-charcoal cursor-pointer select-none">
              Set as primary default shipping address
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              Save Address
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-muted-text uppercase tracking-wider-brand">
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <MapPin className="w-8 h-8 text-muted-text mx-auto opacity-40" />
          <p className="text-sm font-medium text-charcoal">No saved addresses</p>
          <p className="text-xs text-muted-text">Add your home or office address to speed up future checkouts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-soft-beige rounded-xs p-4 bg-white relative space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal text-sm">{addr.full_name}</span>
                {addr.is_default && <Badge variant="olive" size="xs">Default</Badge>}
              </div>
              <p className="text-muted-text">{addr.street_address}</p>
              <p className="text-muted-text">{addr.district}, {addr.city}</p>
              <p className="text-charcoal font-medium pt-1">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;

