import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, AlertTriangle, ShoppingBag, CreditCard, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading, error, fetchCart, cartCount, subtotal, itemCount } = useCart();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Page Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-emerald-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md border border-white/15 mb-4">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Shopping Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              My <span className="text-emerald-300">Cart</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-200 max-w-xl">
              {!isLoading && !error && cartItems.length > 0
                ? `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart — ready for checkout.`
                : 'Review and manage items before checkout.'}
            </p>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"></div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-emerald-100"></div>
              <Loader2 className="absolute inset-0 h-14 w-14 animate-spin text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
              Loading your cart...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 shadow-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Unable to load your cart</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Something went wrong. Please try again.</p>
            </div>
            <button
              onClick={fetchCart}
              className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-400 shadow-sm border border-emerald-100">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Your cart is empty 🛒</h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
                Looks like you haven't added anything yet. Start browsing and add products to your cart.
              </p>
            </div>
            <Link
              to="/products"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-500" />
                  Order Summary
                </h2>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Unique Products</span>
                    <span className="font-semibold text-slate-800">{itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Items</span>
                    <span className="font-semibold text-slate-800">{cartCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Subtotal</span>
                  <span className="text-2xl font-extrabold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <Link
                  to="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/15 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.97] transition-all cursor-pointer"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </Link>

                <Link
                  to="/products"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 active:scale-[0.97] transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
