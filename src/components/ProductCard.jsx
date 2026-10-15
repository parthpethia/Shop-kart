import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Eye, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, wishlistedIds = [], onWishlistChange }) => {
  const { addToCart } = useCart();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [cartError, setCartError] = useState(null);

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isWishlisted = wishlistedIds.includes(product._id);

  // ♡ / ♥ Wishlist Toggle
  const handleWishlistToggle = async () => {
    if (isWishlisting) return;
    try {
      setIsWishlisting(true);
      setWishlistError(null);
      const response = await api.patch(`/wishlist/${product._id}/toggle`);
      if (onWishlistChange) {
        onWishlistChange(product._id, response.data.saved);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setWishlistError('Login required');
      } else {
        setWishlistError('Failed');
      }
      setTimeout(() => setWishlistError(null), 2000);
    } finally {
      setIsWishlisting(false);
    }
  };

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    try {
      setIsAddingToCart(true);
      setCartError(null);
      await addToCart(product._id);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartError('Login required');
      } else if (err.response?.status === 400) {
        setCartError('Max stock reached');
      } else {
        setCartError('Failed to add');
      }
      setTimeout(() => setCartError(null), 2500);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      id={`product-card-${product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200/60 transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image';
          }}
        />
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm border border-white/60">
            <Tag className="h-3 w-3 text-indigo-500" />
            {product.category}
          </span>
        </div>

        {/* Wishlist heart button — top right */}
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlisting}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 active:scale-90 cursor-pointer
            ${isWishlisted
              ? 'bg-rose-500 text-white border border-rose-400 hover:bg-rose-600'
              : 'bg-white/90 text-slate-500 border border-white/60 hover:text-rose-500 hover:bg-white'}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isWishlisting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-white' : ''}`} />
          )}
        </button>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-indigo-700 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          {/* Stock status */}
          <div className="mt-2 flex items-center gap-1.5">
            <Package className={`h-3.5 w-3.5 ${isLowStock ? 'text-amber-500' : isInStock ? 'text-emerald-500' : 'text-rose-400'}`} />
            <span className={`text-xs font-medium ${isLowStock ? 'text-amber-600' : isInStock ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isInStock
                ? isLowStock
                  ? `Only ${product.stock} left!`
                  : `${product.stock} units in stock`
                : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Error messages */}
        {(wishlistError || cartError) && (
          <p className="mt-2 text-xs font-semibold text-rose-500 animate-fade-in">
            {wishlistError || cartError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/products/${product._id}`}
            id={`view-details-${product._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/15 active:scale-[0.97] transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || isAddingToCart}
            id={`add-to-cart-${product._id}`}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.97] cursor-pointer
              ${isInStock
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/15'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
