import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, CreditCard, Check, ArrowRight, ArrowLeft,
  Truck, Shield, AlertCircle, ShoppingBag, Phone, Mail,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getShippingZones } from '../../services/shippingService';
import { createOrder } from '../../services/orderService';
import { formatPrice, formatSomaliPhone } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { buildImageUrl } from '../../lib/imagekit';

const STEPS = [
  { id: 1, label: 'Contact', icon: User },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Payment', icon: CreditCard },
];

const SOMALI_CITIES = [
  { name: 'Mogadishu', zone: 'Mogadishu Metropolitan' },
  { name: 'Hargeisa', zone: 'Somaliland Urban' },
  { name: 'Garowe', zone: 'Puntland Hubs' },
  { name: 'Bosaso', zone: 'Puntland Hubs' },
  { name: 'Kismayo', zone: 'Southern Centers' },
  { name: 'Baidoa', zone: 'Southern Centers' },
  { name: 'Borama', zone: 'Somaliland Urban' },
  { name: 'Berbera', zone: 'Somaliland Urban' },
  { name: 'Burao', zone: 'Somaliland Urban' },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [shippingZones, setShippingZones] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    city: 'Mogadishu',
    district: '',
    streetAddress: '',
    deliveryInstructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('evc_plus');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Sync profile when auth state resolves
  useEffect(() => {
    if (profile) {
      setCustomerInfo((prev) => ({
        fullName: prev.fullName || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
        email: prev.email || user?.email || '',
      }));
    }
  }, [profile, user]);

  // Load Shipping Zones
  useEffect(() => {
    getShippingZones().then(({ data }) => {
      setShippingZones(data || []);
      // Default to first method of first zone
      if (data && data[0]?.methods?.[0]) {
        setSelectedMethod(data[0].methods[0]);
      }
    });
  }, []);

  // Update shipping method when city changes
  const handleCityChange = (newCity) => {
    const cityConfig = SOMALI_CITIES.find((c) => c.name === newCity);
    const targetZoneName = cityConfig ? cityConfig.zone : 'Mogadishu Metropolitan';
    const zone = shippingZones.find((z) => z.name === targetZoneName) || shippingZones[0];

    if (zone?.methods?.[0]) {
      setSelectedMethod(zone.methods[0]);
    }
    setShippingAddress((prev) => ({ ...prev, city: newCity }));
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="bg-warm-ivory min-h-[75vh] flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md space-y-5">
          <div className="w-16 h-16 rounded-full bg-soft-beige flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-muted-text" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Your cart is empty</h1>
          <p className="text-sm text-muted-text">Add items to your cart before proceeding to checkout.</p>
          <Link to="/shop">
            <Button variant="primary" size="md">Browse Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!customerInfo.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      newErrors.email = 'Valid email address is required.';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Somali contact phone is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required.';
    if (!shippingAddress.district.trim()) newErrors.district = 'District or neighborhood is required.';
    if (!shippingAddress.streetAddress.trim()) newErrors.streetAddress = 'Street address / landmark is required.';
    if (!selectedMethod) newErrors.shippingMethod = 'Please select a delivery method.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      toast.error('Please fill in all required shipping and contact fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerInfo,
        shippingAddress,
        shippingMethod: selectedMethod,
        items: items.map((i) => ({
          variantId: i.variantId,
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          size: i.size,
          colorName: i.colorName,
          price: i.price,
          quantity: i.quantity,
        })),
        paymentMethod,
        userId: user?.id || null,
      };

      const { data: order, error } = await createOrder(payload);

      if (error || !order) {
        throw new Error(error?.message || 'Failed to generate order.');
      }

      // Success: clear cart and redirect to confirmation
      clearCart();
      toast.success(`Order ${order.order_number} confirmed!`);
      navigate(`/order-confirmation?orderNumber=${order.order_number}`);
    } catch (err) {
      console.error('[CheckoutPage] Order placement error:', err);
      toast.error(err.message || 'There was an issue processing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryFee = Number(selectedMethod?.fee || 0);
  const orderTotal = subtotal + deliveryFee;

  return (
    <div className="bg-warm-ivory min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-soft-beige -translate-y-1/2 z-0" />
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = s.id < step;
              const isCurrent = s.id === step;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-xs transition-colors duration-200 ${
                      isDone
                        ? 'bg-charcoal text-white'
                        : isCurrent
                        ? 'bg-muted-olive text-white ring-4 ring-muted-olive/20'
                        : 'bg-white text-muted-text border border-soft-beige'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider-brand font-medium ${isCurrent ? 'text-charcoal font-semibold' : 'text-muted-text'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Checkout Form Steps */}
          <div className="lg:col-span-7 bg-white border border-soft-beige rounded-xs p-6 sm:p-8 shadow-soft">
            {/* STEP 1: Customer Contact */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-charcoal">Customer Information</h2>
                  <p className="text-xs text-muted-text mt-1">We will send your order confirmation and dispatch receipt here.</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="e.g. Hassan Mohamed"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                    error={errors.fullName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Somali Phone Number"
                      required
                      placeholder="e.g. +252 61 500 0000"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      error={errors.phone}
                      helperText="Supports EVC Plus (061), ZAAD (063), and eDahab (065/062)"
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      error={errors.email}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="primary" size="lg" onClick={handleNext} icon={ArrowRight} iconPosition="right">
                    Continue to Shipping
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Shipping Destination & Zone */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center justify-between border-b border-soft-beige pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-medium text-charcoal">Delivery Address</h2>
                    <p className="text-xs text-muted-text mt-1">Enter your delivery address and preferred courier option.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-muted-olive hover:underline font-medium">
                    Edit Contact
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal block">
                        City / Region <span className="text-status-error">*</span>
                      </label>
                      <select
                        value={shippingAddress.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-warm-ivory border border-soft-beige rounded-xs focus:outline-none focus:border-charcoal text-charcoal"
                      >
                        {SOMALI_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="District / Neighborhood"
                      required
                      placeholder="e.g. Hodan / Waberi / Jigjiga Yar"
                      value={shippingAddress.district}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                      error={errors.district}
                    />
                  </div>

                  <Input
                    label="Street Address / Landmark"
                    required
                    placeholder="e.g. Near KM4 Roundabout, Maka Al-Mukarama St"
                    value={shippingAddress.streetAddress}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                    error={errors.streetAddress}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal block">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please call before dispatch or leave with building security"
                      value={shippingAddress.deliveryInstructions}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, deliveryInstructions: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-warm-ivory border border-soft-beige rounded-xs focus:outline-none focus:border-charcoal text-charcoal resize-none placeholder:text-muted-text/60"
                    />
                  </div>

                  {/* Available Courier Methods */}
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal block">
                      Available Delivery Courier
                    </span>
                    <div className="space-y-2">
                      {shippingZones.flatMap((z) => z.methods || []).map((method) => {
                        const isSelected = selectedMethod?.id === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer transition-colors ${
                              isSelected ? 'border-charcoal bg-warm-ivory/60' : 'border-soft-beige hover:border-charcoal/40 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethod(method)}
                                className="accent-charcoal"
                              />
                              <div>
                                <span className="font-medium text-sm text-charcoal block">{method.name}</span>
                                <span className="text-xs text-muted-text">{method.estimated_delivery_time}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-charcoal">{formatPrice(method.fee)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-soft-beige">
                  <Button variant="ghost" size="md" onClick={() => setStep(1)} icon={ArrowLeft} iconPosition="left">
                    Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleNext} icon={ArrowRight} iconPosition="right">
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment Method Selection */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center justify-between border-b border-soft-beige pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-medium text-charcoal">Payment Method</h2>
                    <p className="text-xs text-muted-text mt-1">Select your preferred Somali mobile money or cash on delivery option.</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-muted-olive hover:underline font-medium">
                    Edit Shipping
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'evc_plus', name: 'EVC Plus', desc: 'Hormuud Mobile Money (*712*...)', badge: 'Mogadishu & South' },
                    { id: 'edahab', name: 'eDahab', desc: 'Somtel / Dahabshiil Mobile Payment (*789*...)', badge: 'Nationwide' },
                    { id: 'zaad', name: 'ZAAD Service', desc: 'Telesom Mobile Money (*880*...)', badge: 'Somaliland' },
                    { id: 'pay_on_delivery', name: 'Pay on Delivery', desc: 'Pay courier directly via cash or mobile money upon handover', badge: 'Mogadishu only' },
                  ].map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-start justify-between p-4 border rounded-xs cursor-pointer transition-colors ${
                        paymentMethod === pm.id ? 'border-charcoal bg-warm-ivory/60' : 'border-soft-beige hover:border-charcoal/40 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === pm.id}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="accent-charcoal mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-charcoal">{pm.name}</span>
                            <Badge variant="olive" size="xs">{pm.badge}</Badge>
                          </div>
                          <span className="text-xs text-muted-text mt-0.5 block">{pm.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod !== 'pay_on_delivery' && (
                  <div className="p-4 bg-soft-beige/30 border border-soft-beige rounded-xs space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal block">
                      Mobile Money Payment Phone
                    </span>
                    <input
                      type="text"
                      placeholder={customerInfo.phone || 'e.g. 061XXXXXXX or +252...'}
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-soft-beige rounded-xs focus:outline-none focus:border-charcoal text-charcoal"
                    />
                    <p className="text-[11px] text-muted-text">
                      An instant mobile money payment push request will be triggered upon placing this order.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-soft-beige">
                  <Button variant="ghost" size="md" onClick={() => setStep(2)} icon={ArrowLeft} iconPosition="left">
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePlaceOrder}
                    isLoading={submitting}
                    icon={Check}
                    iconPosition="right"
                  >
                    Confirm & Place Order ({formatPrice(orderTotal)})
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-soft-beige rounded-xs p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-soft-beige pb-4">
                <h3 className="font-serif text-lg font-medium text-charcoal">Order Summary</h3>
                <span className="text-xs text-muted-text">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>

              {/* Items Compact Preview */}
              <ul className="divide-y divide-soft-beige/70 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.variantId} className="py-3 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-xs bg-soft-beige/50 shrink-0 overflow-hidden border border-soft-beige">
                      {item.image ? (
                        <img src={buildImageUrl(item.image, { width: 96, height: 128 })} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-text">
                          <ShoppingBag className="w-4 h-4 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-muted-text">
                        {item.size} / {item.colorName} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-charcoal shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price Calculations */}
              <div className="border-t border-soft-beige pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-text">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-text">
                  <span>Delivery ({selectedMethod?.name || 'Standard'})</span>
                  <span className="font-medium text-charcoal">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t border-soft-beige pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-semibold text-charcoal">Total Amount</span>
                  <span className="font-serif text-xl font-bold text-charcoal">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-soft-beige pt-4 space-y-2 text-[11px] text-muted-text">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-olive shrink-0" />
                  <span>Secure SSL transaction and genuine product guarantee.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-olive shrink-0" />
                  <span>Nationwide courier delivery across Somalia.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

