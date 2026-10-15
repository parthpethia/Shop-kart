import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User, Sparkles, ShieldCheck, Heart, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Get cart count from global context
  const { cartCount } = useCart();

  // Bonus: fetch wishlist count
  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    const fetchWishlistCount = async () => {
      try {
        const response = await api.get('/wishlist');
        setWishlistCount(response.data.count || 0);
      } catch {
        // ignore
      }
    };
    fetchWishlistCount();
  }, [user, location.pathname]);

  /**
   * Task 4 — Logout Flow (15 Marks)
   * 1. Triggered on Logout button click
   * 2. Calls POST /customers/logout with withCredentials: true
   * 3. Backend clears the HttpOnly cookie
   * 4. Updates client state and redirects to /login
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post('/customers/logout');
    } catch (err) {
      console.warn('Logout API notification error (clearing local state anyway):', err);
    } finally {
      setIsLoggingOut(false);
      if (onLogout) {
        onLogout();
      }
      navigate('/login', {
        state: { successMessage: 'You have been logged out successfully.' },
        replace: true,
      });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link 
          to={user ? "/home" : "/login"} 
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
              Shop<span className="text-indigo-600">Kart</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider -mt-1">
              Store &amp; Beyond
            </span>
          </div>
        </Link>

        {/* Navigation & Auth Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            /* Logged-in State Navigation */
            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                to="/home"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/home')
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>

              <Link
                to="/products"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/products') || location.pathname.startsWith('/products/')
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Products
              </Link>

              {/* Wishlist Link with Count */}
              <Link
                to="/wishlist"
                className={`relative inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                  isActive('/wishlist')
                    ? 'text-rose-600'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isActive('/wishlist') ? 'fill-rose-600' : ''}`} />
                <span className="hidden sm:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link with Count */}
              <Link
                to="/cart"
                className={`relative inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                  isActive('/cart')
                    ? 'text-emerald-600'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white min-w-[16px]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Orders Link */}
              <Link
                to="/orders"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/orders') || location.pathname.startsWith('/order')
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orders
              </Link>

              {/* Customer Avatar & Name Badge */}
              <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1.5 pr-3.5 shadow-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                    {user.name || user.fullName || 'Customer'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium leading-none flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                    Authenticated
                  </span>
                </div>
              </div>

              {/* Logout Button (Task 4) */}
              <button
                id="logout-button"
                data-testid="logout-button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-100 hover:border-rose-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Log out of ShopKart"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            /* Logged-out State Navigation */
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                id="nav-login-link"
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive('/login')
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition-all ${
                  isActive('/register')
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
