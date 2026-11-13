import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerOrders } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    getCustomerOrders(user.id).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-muted-text uppercase tracking-wider-brand">
        Loading your order history...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-soft-beige/70 flex items-center justify-center mx-auto text-muted-text">
          <Package className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-medium text-charcoal">No Orders Placed Yet</h2>
          <p className="text-sm text-muted-text">When you place an order, it will appear here for easy tracking.</p>
        </div>
        <Link to="/shop">
          <Button variant="primary" size="sm">Explore Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-soft-beige pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-charcoal">Order History</h2>
          <p className="text-xs text-muted-text mt-1">Track and review past orders fulfilled across Somalia.</p>
        </div>
        <span className="text-xs text-muted-text">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-soft-beige rounded-xs p-5 hover:border-charcoal/40 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-soft-beige/60 pb-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-charcoal text-sm">{order.order_number}</span>
                <Badge variant="olive" size="xs">{order.order_status}</Badge>
              </div>
              <span className="text-muted-text flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 text-xs text-muted-text">
                <p className="text-charcoal font-medium">
                  {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                </p>
                <p>Payment: <span className="capitalize">{order.payment_method?.replace(/_/g, ' ')}</span> ({order.payment_status})</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-serif text-lg font-bold text-charcoal">
                  {formatPrice(order.total_amount)}
                </span>
                <Link to={`/order-confirmation?orderNumber=${order.order_number}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;

