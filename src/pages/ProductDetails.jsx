import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Tag, Package, ShoppingCart, Loader2,
  AlertTriangle, Star, Shield, Truck, RotateCcw,
} from 'lucide-react';
import api, { getErrorMessage } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        if (isMounted) {
          setProduct(response.data.product);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Product not found. It may have been removed.');
          } else if (err.response?.status === 400) {
            setError('Invalid product ID. Please check the URL.');
          } else {
            setError(getErrorMessage(err));
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    // UI-only for now — Cart functionality in Lab-04
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            {/* Back button skeleton */}
            <div className="h-8 w-32 rounded-lg bg-slate-200"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Image skeleton */}
              <div className="aspect-square rounded-3xl bg-slate-200"></div>
              {/* Info skeleton */}
              <div className="space-y-4">
                <div className="h-5 w-24 rounded-full bg-slate-200"></div>
                <div className="h-10 w-3/4 rounded-xl bg-slate-200"></div>
                <div className="h-12 w-40 rounded-xl bg-slate-200"></div>
                <div className="h-24 w-full rounded-xl bg-slate-200"></div>
                <div className="h-12 w-48 rounded-xl bg-slate-200"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">{error}</p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Go Back
            </button>
            <Link
              to="/products"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">

        {/* Breadcrumb / Back Link */}
        <Link
          to="/products"
          id="back-to-products"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Product Image */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover aspect-square"
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image';
              }}
            />
            {!isInStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <span className="rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white uppercase tracking-wider shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            {/* Category Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Tag className="h-3.5 w-3.5" />
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 id="product-name" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span id="product-price" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inclusive of all taxes</span>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h3>
              <p id="product-description" className="text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className={`h-5 w-5 ${isLowStock ? 'text-amber-500' : isInStock ? 'text-emerald-500' : 'text-rose-400'}`} />
              <span
                id="product-stock"
                className={`text-sm font-bold ${isLowStock ? 'text-amber-600' : isInStock ? 'text-emerald-600' : 'text-rose-500'}`}
              >
                {isInStock
                  ? isLowStock
                    ? `Hurry! Only ${product.stock} left in stock`
                    : `${product.stock} units in stock`
                  : 'Currently out of stock'}
              </span>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-3 text-center">
                <Truck className="h-5 w-5 text-indigo-500" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-3 text-center">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-3 text-center">
                <RotateCcw className="h-5 w-5 text-amber-500" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">7 Day Returns</span>
              </div>
            </div>

            {/* Add to Cart Button (UI only) */}
            <button
              id="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`mt-2 inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-md transition-all duration-200 active:scale-[0.97] cursor-pointer
                ${isInStock
                  ? addedToCart
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
                    : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {addedToCart
                ? 'Added to Cart ✓'
                : isInStock
                  ? 'Add to Cart'
                  : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
