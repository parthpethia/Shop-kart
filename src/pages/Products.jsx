import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, AlertTriangle, PackageOpen, Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [wishlistedIds, setWishlistedIds] = useState([]);

  // Debounce search input to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string dynamically
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);

      const queryString = params.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch wishlist IDs for heart toggle state
  useEffect(() => {
    const fetchWishlistIds = async () => {
      try {
        const response = await api.get('/wishlist');
        const ids = (response.data.wishlist || []).map((p) => p._id);
        setWishlistedIds(ids);
      } catch {
        // Not logged in or error — silently ignore
      }
    };
    fetchWishlistIds();
  }, []);

  const handleWishlistChange = (productId, saved) => {
    setWishlistedIds((prev) =>
      saved ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-indigo-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md border border-white/15 mb-4">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Product Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Discover <span className="text-amber-400">Products</span>
            </h1>
            <p className="text-sm sm:text-base text-indigo-200 max-w-xl">
              Browse our entire catalog. Search by name, filter by category, or sort by price to find exactly what you're looking for.
            </p>
          </div>
          {/* Background Decorative Gradient Orbs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"></div>
        </section>

        {/* Search & Filter Bar */}
        <section className="glass-panel rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
          />
        </section>

        {/* Active Filters Indicator */}
        {(debouncedSearch || category || sort) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-indigo-700 font-semibold">
                Search: "{debouncedSearch}"
                <button onClick={() => setSearch('')} className="ml-0.5 hover:text-indigo-900 cursor-pointer">×</button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-700 font-semibold">
                {category}
                <button onClick={() => setCategory('')} className="ml-0.5 hover:text-amber-900 cursor-pointer">×</button>
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-700 font-semibold">
                {sort === 'price_asc' ? 'Price: Low → High' : 'Price: High → Low'}
                <button onClick={() => setSort('')} className="ml-0.5 hover:text-emerald-900 cursor-pointer">×</button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-indigo-100"></div>
              <Loader2 className="absolute inset-0 h-14 w-14 animate-spin text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
              Loading products...
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
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Something went wrong while loading products. Please try again.
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-sm">
              <PackageOpen className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {debouncedSearch || category
                  ? 'Try adjusting your search or filter criteria.'
                  : 'The product catalog is empty right now. Check back later!'}
              </p>
            </div>
            {(debouncedSearch || category) && (
              <button
                onClick={() => { setSearch(''); setCategory(''); setSort(''); }}
                className="mt-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-800">{products.length}</span> product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div
              id="products-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlistedIds={wishlistedIds}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Products;
