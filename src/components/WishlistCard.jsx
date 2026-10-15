import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Eye, HeartOff, Loader2 } from 'lucide-react';

const WishlistCard = ({ product, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleRemove = async () => {
    if (isRemoving) return;
    try {
      setIsRemoving(true);
      await onRemove(product._id);
    } catch {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-lg hover:border-rose-200/60 transition-all duration-300">
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
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm border border-white/60">
            <Tag className="h-3 w-3 text-indigo-500" />
            {product.category}
          </span>
        </div>
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-1.5">
          {product.name}
        </h3>

        <div className="mt-auto">
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
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

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.97] transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </Link>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-100 hover:border-rose-300 active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRemoving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <HeartOff className="h-3.5 w-3.5" />
                Remove ♥
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
