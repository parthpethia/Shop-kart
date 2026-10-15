import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Loader2, AlertTriangle, ShoppingBag, ClipboardList } from 'lucide-react';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <p className="text-lg font-bold text-slate-900">{error}</p>
        <Link to="/orders" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">

        {/* Success Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm text-center space-y-6">

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100 animate-bounce-slow">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Order Placed Successfully! 🎉</h1>
            <p className="text-sm text-slate-500 mt-2">Your order has been confirmed and saved.</p>
          </div>

          {/* Order Details */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                {order?._id?.slice(-8).toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-xl font-extrabold text-slate-900">₹{order?.totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                order?.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {order?.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-bold">
                {order?.status}
              </span>
            </div>

            {/* Items */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items Ordered</p>
              {order?.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.97] transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              View My Orders
            </Link>
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
