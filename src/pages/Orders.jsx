import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, AlertTriangle, ShoppingBag, Package, Eye } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';

const STATUS_COLORS = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PLACED: 'bg-indigo-100 text-indigo-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
};

const PAYMENT_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
};

// Visual status progression bar
const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const StatusProgress = ({ status }) => {
  const currentIndex = STATUS_STEPS.indexOf(status);
  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
            i <= currentIndex ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 rounded-full transition-all ${
              i < currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { successMessage: 'Please log in to view your orders.' }, replace: true });
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Page Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md border border-white/15 mb-4">
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Order History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              My <span className="text-amber-300">Orders</span>
            </h1>
            <p className="text-sm text-indigo-200">
              {!isLoading && !error && orders.length > 0
                ? `You have placed ${orders.length} order${orders.length !== 1 ? 's' : ''}.`
                : 'Track and review your purchase history.'}
            </p>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"></div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-14 w-14 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertTriangle className="h-12 w-12 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900">Unable to load orders</h3>
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={fetchOrders} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-400 border border-indigo-100">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">You have not placed any orders yet</h3>
            <p className="text-sm text-slate-500 max-w-sm text-center">Start shopping and place your first order!</p>
            <Link to="/products" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PAYMENT_COLORS[order.paymentStatus] || ''}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5 mb-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-slate-400">+{order.items.length - 3} more item(s)</p>
                  )}
                </div>

                {/* Status Progress (bonus) */}
                {order.paymentStatus === 'PAID' && <StatusProgress status={order.status} />}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-lg font-extrabold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  <Link
                    to={`/order-success/${order._id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
