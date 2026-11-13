import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-soft-beige pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-charcoal">Profile Information</h2>
          <p className="text-xs text-muted-text mt-1">Manage your customer credentials and contact details.</p>
        </div>
        <Badge variant="olive" size="xs">
          Role: {profile?.role || 'Customer'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <Input
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          disabled
          value={user?.email || ''}
          helperText="Email address is permanently associated with your account credentials."
        />

        <Input
          label="Somali Contact Phone"
          value={phone}
          placeholder="+252 61 500 0000"
          onChange={(e) => setPhone(e.target.value)}
          helperText="Used for courier delivery updates and mobile money payments."
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

