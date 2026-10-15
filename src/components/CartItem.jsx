import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);

  const { product, quantity } = item;
  if (!product) return null;

  const lineTotal = product.price * quantity;
  const canIncrease = quantity < product.stock;

  const handleIncrease = async () => {
    if (isUpdating || !canIncrease) return;
    try {
      setIsUpdating(true);
      setError(null);
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
      setTimeout(() => setError(null), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async () => {
    if (isUpdating || quantity <= 1) return;
    try {
      setIsUpdating(true);
      setError(null);
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
      setTimeout(() => setError(null), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    try {
      setIsRemoving(true);
      await removeFromCart(product._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
      setTimeout(() => setError(null), 2500);
      setIsRemoving(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all ${isRemoving ? 'opacity-50 scale-[0.98]' : ''}`}>
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="h-28 w-28 rounded-xl object-cover border border-slate-200/60"
          onError={(e) => {
            e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=No+Image';
          }}
        />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <Link to={`/products/${product._id}`} className="text-base font-bold text-slate-900 hover:text-indigo-700 transition-colors line-clamp-2">
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
          <p className="text-sm font-bold text-slate-700 mt-1">₹{product.price.toLocaleString('en-IN')}</p>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[11px] font-semibold text-amber-600 mt-1">Only {product.stock} left!</p>
          )}
          {error && (
            <p className="text-xs font-semibold text-rose-500 mt-1 animate-fade-in">{error}</p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
            <button
              onClick={handleDecrease}
              disabled={isUpdating || quantity <= 1}
              className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-9 w-10 items-center justify-center text-sm font-bold text-slate-800 border-x border-slate-200 bg-white">
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" /> : quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={isUpdating || !canIncrease}
              className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Line Total */}
        <div className="text-right shrink-0 w-28">
          <p className="text-lg font-extrabold text-slate-900">₹{lineTotal.toLocaleString('en-IN')}</p>
          {quantity > 1 && (
            <p className="text-[11px] text-slate-400">{quantity} × ₹{product.price.toLocaleString('en-IN')}</p>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/70 text-rose-500 hover:bg-rose-100 hover:border-rose-300 active:scale-90 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          title="Remove from cart"
        >
          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
