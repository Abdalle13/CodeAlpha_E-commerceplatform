import React, { useState } from 'react';
import { Settings, Store, Phone, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage = () => {
  const toast = useToast();
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'HILAARA Store',
    tagline: 'Modern Somali Luxury Fashion',
    officialEmail: 'contact@hilaara.so',
    supportPhone: '+252 61 700 8899',
    whatsappSupport: '+252 61 700 8899',
    storeAddress: 'KM4 Maka Al-Mukarama Road, Hodan District, Mogadishu, Somalia',
    announcementText: 'Complimentary delivery in Mogadishu on orders over $150 | Nationwide courier dispatch',
    isAnnouncementActive: true,
    evcMerchantCode: '617008899',
    zaadMerchantCode: '4112233',
    edahabMerchantCode: '8223344',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Store settings saved successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-soft-beige">
        <h1 className="font-serif text-2xl font-medium text-charcoal">Store Identity & Configuration</h1>
        <p className="text-xs text-muted-text mt-0.5">
          General settings, customer support hotlines, announcement banner, and merchant account codes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Contact */}
        <div className="bg-white border border-soft-beige rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-soft-beige">
            <Store className="w-4 h-4 text-muted-olive" />
            <h2 className="font-serif font-semibold text-sm text-charcoal">General Brand Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={storeSettings.tagline}
                onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Customer Support Email</label>
              <input
                type="email"
                value={storeSettings.officialEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, officialEmail: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Customer Support Phone / WhatsApp</label>
              <input
                type="text"
                value={storeSettings.supportPhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Mogadishu Headquarters / Showroom Address</label>
            <input
              type="text"
              value={storeSettings.storeAddress}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
              className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
            />
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-soft-beige rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-soft-beige">
            <h2 className="font-serif font-semibold text-sm text-charcoal">Storefront Announcement Banner</h2>
          </div>

          <div>
            <label className="font-semibold block mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={storeSettings.announcementText}
              onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
              className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={storeSettings.isAnnouncementActive}
              onChange={(e) => setStoreSettings({ ...storeSettings, isAnnouncementActive: e.target.checked })}
              className="accent-charcoal"
            />
            <span className="font-medium text-charcoal">Display announcement bar on top of storefront</span>
          </label>
        </div>

        {/* Mobile Money Merchant Codes */}
        <div className="bg-white border border-soft-beige rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-soft-beige">
            <ShieldCheck className="w-4 h-4 text-muted-olive" />
            <h2 className="font-serif font-semibold text-sm text-charcoal">Merchant Account Numbers (Somalia)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-1">EVC Plus (Hormuud)</label>
              <input
                type="text"
                value={storeSettings.evcMerchantCode}
                onChange={(e) => setStoreSettings({ ...storeSettings, evcMerchantCode: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">ZAAD (Telesom)</label>
              <input
                type="text"
                value={storeSettings.zaadMerchantCode}
                onChange={(e) => setStoreSettings({ ...storeSettings, zaadMerchantCode: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">eDahab (Somtel)</label>
              <input
                type="text"
                value={storeSettings.edahabMerchantCode}
                onChange={(e) => setStoreSettings({ ...storeSettings, edahabMerchantCode: e.target.value })}
                className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
