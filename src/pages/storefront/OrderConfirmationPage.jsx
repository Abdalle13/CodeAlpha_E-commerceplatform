import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Package, MapPin, CreditCard, ArrowRight,
  Phone, Mail, Calendar, ShoppingBag,
} from 'lucide-react';
import { getOrderByNumber } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    getOrderByNumber(orderNumber).then(({ data }) => {
      setOrder(data);
      setLoading(false);
    });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="bg-warm-ivory min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider-brand text-muted-text">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-warm-ivory min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <Package className="w-12 h-12 text-muted-text mx-auto" />
          <h1 className="font-serif text-2xl font-medium text-charcoal">Order Not Found</h1>
          <p className="text-sm text-muted-text">
            We could not locate this order reference. Please check your order number or contact support.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory min-h-screen py-12 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-muted-olive/15 border border-muted-olive/30 flex items-center justify-center mx-auto text-muted-olive">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-semibold">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
              Thank You for Your Order
            </h1>
            <p className="text-sm text-muted-text max-w-md mx-auto">
              Your order <strong className="text-charcoal font-semibold">{order.order_number}</strong> has been received and is being prepared for courier dispatch.
            </p>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <div className="bg-white border border-soft-beige rounded-xs p-6 sm:p-8 shadow-soft space-y-8">
          {/* Top Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-soft-beige text-xs">
            <div>
              <span className="text-muted-text block uppercase tracking-wider-brand text-[10px]">Order Number</span>
              <span className="font-mono font-bold text-charcoal text-sm mt-0.5 block">{order.order_number}</span>
            </div>
            <div>
              <span className="text-muted-text block uppercase tracking-wider-brand text-[10px]">Date</span>
              <span className="font-medium text-charcoal text-sm mt-0.5 block">{formatDate(order.created_at)}</span>
            </div>
            <div>
              <span className="text-muted-text block uppercase tracking-wider-brand text-[10px]">Payment Method</span>
              <span className="font-medium text-charcoal capitalize text-sm mt-0.5 block">
                {order.payment_method?.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-muted-text block uppercase tracking-wider-brand text-[10px]">Status</span>
              <Badge variant="olive" size="xs" className="mt-1">
                {order.order_status}
              </Badge>
            </div>
          </div>

          {/* Delivery & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                <MapPin className="w-3.5 h-3.5 text-muted-olive" />
                <span>Delivery Address</span>
              </div>
              <div className="text-muted-text text-xs space-y-0.5 pl-5">
                <p className="font-medium text-charcoal text-sm">{order.customer_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_district}, {order.shipping_city}, Somalia</p>
                {order.delivery_instructions && (
                  <p className="italic text-muted-text/80 pt-1">Note: "{order.delivery_instructions}"</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider-brand text-charcoal">
                <Phone className="w-3.5 h-3.5 text-muted-olive" />
                <span>Contact Details</span>
              </div>
              <div className="text-muted-text text-xs space-y-1 pl-5">
                <p className="font-medium text-charcoal">{order.customer_phone}</p>
                <p>{order.customer_email}</p>
                <p className="text-muted-olive font-medium pt-1">Nationwide courier tracking active</p>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider-brand text-charcoal border-b border-soft-beige pb-2">
              Items Ordered
            </h3>
            <ul className="divide-y divide-soft-beige">
              {(order.items || []).map((item, index) => (
                <li key={item.id || index} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-charcoal block">{item.product_name}</span>
                    <span className="text-xs text-muted-text">
                      Size: {item.variant_size} • Color: {item.variant_color_name} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-charcoal text-sm shrink-0">
                    {formatPrice(item.total_price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-soft-beige pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted-text">
              <span>Subtotal</span>
              <span className="font-medium text-charcoal">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-status-success font-medium">
                <span>Promotional Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-text">
              <span>Courier Delivery Fee</span>
              <span className="font-medium text-charcoal">{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="border-t border-soft-beige pt-3 flex justify-between items-baseline text-sm">
              <span className="font-semibold text-charcoal">Total Amount</span>
              <span className="font-serif text-xl font-bold text-charcoal">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/shop">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/account/orders">
            <Button variant="outline" size="md">
              View Order History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

