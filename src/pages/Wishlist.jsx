import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader2, AlertTriangle, ShoppingBag } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/wishlist');
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', {
          state: { successMessage: 'Please log in to view your wishlist.' },
          replace: true,
        });
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-rose-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-rose-300 backdrop-blur-md border border-white/15 mb-4">
              <Heart className="h-3.5 w-3.5 fill-rose-300" />
              <span>My Wishlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Saved <span className="text-rose-300">Products</span>
            </h1>
            <p className="text-sm sm:text-base text-rose-200 max-w-xl">
              {!isLoading && !error && wishlist.length > 0
                ? `You have ${wishlist.length} product${wishlist.length !== 1 ? 's' : ''} saved in your wishlist.`
                : 'Products you love, saved for later.'}
            </p>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"></div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-rose-100"></div>
              <Loader2 className="absolute inset-0 h-14 w-14 animate-spin text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
              Loading your wishlist...
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
              <h3 className="text-lg font-bold text-slate-900">Something went wrong</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">We couldn't load your wishlist. Please try again.</p>
            </div>
            <button
              onClick={fetchWishlist}
              className="mt-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-400 shadow-sm border border-rose-100">
              <Heart className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
                Save products you love and find them here later.
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

        {/* Wishlist Grid */}
        {!isLoading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
