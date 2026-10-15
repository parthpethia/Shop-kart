import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Sparkles, Package, 
  ShoppingBag, CreditCard, MapPin, Clock, ArrowRight, Heart,
  CheckCircle2, BellRing, Star
} from 'lucide-react';
import api from '../services/api';

const Home = ({ currentUser, onUserLoaded }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(currentUser || null);
  // Only show full loading skeleton if we don't already have user details
  const [isLoading, setIsLoading] = useState(!currentUser?.email);
  const [fetchError, setFetchError] = useState(null);

  // Keep a stable ref to onUserLoaded to prevent effect re-trigger loops
  const onUserLoadedRef = useRef(onUserLoaded);
  useEffect(() => {
    onUserLoadedRef.current = onUserLoaded;
  }, [onUserLoaded]);

  // Sync state if currentUser changes from parent
  useEffect(() => {
    if (currentUser && (currentUser.email || currentUser.fullName || currentUser.name)) {
      setCustomer(currentUser);
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Task 3 — Protected Home Page (30 Marks)
   * Fetches the logged-in user via GET /customers/me
   * If Not Logged In (401 or no auth session) -> Automatically redirect to /login
   */
  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        // Only trigger loading skeleton if user data isn't available yet
        if (!currentUser?.email && !customer?.email) {
          setIsLoading(true);
        }
        setFetchError(null);

        // GET /customers/me with withCredentials: true
        const response = await api.get('/customers/me');
        
        if (isMounted) {
          const userData = response.data.customer || response.data.user || response.data;
          setCustomer(userData);
          if (onUserLoadedRef.current) {
            onUserLoadedRef.current(userData);
          }
        }
      } catch (err) {
        console.warn('Unauthorized or error fetching /customers/me:', err);
        if (isMounted) {
          setFetchError(err.message || 'Session expired');
          // Requirement: If Not Logged In -> Automatically redirect to /login
          navigate('/login', {
            state: { 
              successMessage: 'Please log in to access your ShopKart account.' 
            },
            replace: true,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-4xl space-y-6 animate-pulse">
          {/* Top Banner Skeleton */}
          <div className="h-36 rounded-3xl bg-indigo-100/60 border border-indigo-200/50"></div>
          {/* Info Card Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 rounded-3xl bg-white border border-slate-200/70 p-6"></div>
            <div className="md:col-span-2 h-64 rounded-3xl bg-white border border-slate-200/70 p-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null; // Will redirect in useEffect
  }

  const customerName = customer.name || customer.fullName || 'Customer';
  const customerEmail = customer.email || 'N/A';
  const customerPhone = customer.phone || customer.phoneNumber || 'N/A';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Hero Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-indigo-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md border border-white/15 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ShopKart Club Member</span>
            </div>
            {/* Requirement: Welcome message */}
            <h1 
              id="welcome-message" 
              data-testid="welcome-message"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2"
            >
              Welcome back, <span className="text-amber-400">{customerName}</span>! 👋
            </h1>
            <p className="text-sm sm:text-base text-indigo-200 max-w-xl">
              Glad to have you back at ShopKart! Track your live orders, manage your delivery addresses, and enjoy 50% off on electronics this weekend.
            </p>
          </div>

          {/* Background Decorative Gradient Orbs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"></div>
        </section>

        {/* Customer Profile & Info Cards (Task 3 Core Requirement) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Customer Profile Card */}
          <div className="glass-panel rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-2xl shadow-md shadow-indigo-500/25">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 id="customer-name" data-testid="customer-name" className="text-xl font-bold text-slate-900 leading-snug">
                  {customerName}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              
              {/* Requirement: Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </p>
                  <p id="customer-email" data-testid="customer-email" className="text-sm font-medium text-slate-800 truncate">
                    {customerEmail}
                  </p>
                </div>
              </div>

              {/* Requirement: Phone number */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </p>
                  <p id="customer-phone" data-testid="customer-phone" className="text-sm font-medium text-slate-800">
                    {customerPhone}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Star className="h-4 w-4 fill-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Tier & Membership
                  </p>
                  <p className="text-sm font-medium text-indigo-700">
                    ShopKart Prime Gold
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Stats & E-Commerce Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</span>
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">12</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">2 in transit</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Points</span>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1,480</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">₹148 redemption value</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wishlist</span>
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">8</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">3 on sale</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cart</span>
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">3</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Ready for checkout</p>
              </div>
            </div>

            {/* Recent Orders Showcase */}
            <div className="col-span-2 sm:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Recent Purchases & Tracking
                </h3>
                <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
                  View All History →
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                      🎧
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Sony WH-1000XM5 Wireless Headphones</p>
                      <p className="text-xs text-slate-500">Order #SK-8921 • Delivered yesterday</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                    Delivered
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                      👟
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Nike Air Max 270 Sneakers</p>
                      <p className="text-xs text-slate-500">Order #SK-9042 • Out for delivery today</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                    In Transit
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
