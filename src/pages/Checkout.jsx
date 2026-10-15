import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, Loader2, AlertTriangle, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

// Load Razorpay Checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, cartCount, fetchCart } = useCart();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid phone number (at least 10 digits)';
    }
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      errors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    if (!validateForm()) return;

    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setOrderError('Failed to load payment gateway. Please check your internet connection.');
        setIsPlacingOrder(false);
        return;
      }

      // 2. Create payment order on backend
      const response = await api.post('/orders/create-payment-order', {
        shippingAddress,
      });

      const data = response.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order Payment',
        order_id: data.razorpayOrderId,

        handler: async function (razorpayResponse) {
          // Payment succeeded on Razorpay side → verify on backend
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Clear cart state and navigate to success page
              await fetchCart();
              navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
            } else {
              setOrderError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setOrderError(
              err.response?.data?.message || 'Payment verification failed. Your cart has not been cleared.'
            );
          } finally {
            setIsPlacingOrder(false);
          }
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        theme: {
          color: '#4f46e5',
        },

        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        setOrderError(`Payment failed: ${response.error.description || 'Unknown error'}. Your cart has not been cleared.`);
        setIsPlacingOrder(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Order creation error:', err);
      setOrderError(err.response?.data?.message || 'Failed to create order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) return null;

  const inputClasses = (field) =>
    `w-full rounded-xl border ${
      formErrors[field] ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
    } bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-indigo-900/10">
          <div className="relative z-10 max-w-2xl">
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white transition-colors mb-4">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Cart
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md border border-white/15 mb-4 ml-4">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Checkout</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Complete Your <span className="text-amber-300">Order</span>
            </h1>
            <p className="text-sm text-indigo-200">
              Enter your shipping details and complete payment securely with Razorpay.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        </section>

        {/* Error Banner */}
        {orderError && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-800">{orderError}</p>
              <button
                onClick={() => setOrderError(null)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium mt-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Shipping Form — 3 cols */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                  <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleChange} placeholder="Aarav Sharma" className={inputClasses('fullName')} />
                  {formErrors.fullName && <p className="text-xs text-rose-500 mt-1">{formErrors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number *</label>
                  <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleChange} placeholder="9876543210" className={inputClasses('phone')} />
                  {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pincode *</label>
                  <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleChange} placeholder="560001" maxLength={6} className={inputClasses('pincode')} />
                  {formErrors.pincode && <p className="text-xs text-rose-500 mt-1">{formErrors.pincode}</p>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address *</label>
                  <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleChange} placeholder="22 MG Road, Indiranagar" className={inputClasses('addressLine1')} />
                  {formErrors.addressLine1 && <p className="text-xs text-rose-500 mt-1">{formErrors.addressLine1}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">City *</label>
                  <input type="text" name="city" value={shippingAddress.city} onChange={handleChange} placeholder="Bengaluru" className={inputClasses('city')} />
                  {formErrors.city && <p className="text-xs text-rose-500 mt-1">{formErrors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label>
                  <input type="text" name="state" value={shippingAddress.state} onChange={handleChange} placeholder="Karnataka" className={inputClasses('state')} />
                  {formErrors.state && <p className="text-xs text-rose-500 mt-1">{formErrors.state}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary — 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-500" />
                Order Summary
              </h2>

              <div className="space-y-3 border-t border-slate-100 pt-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product?._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/80/f1f5f9/94a3b8?text=?'; }}
                      />
                      <div className="min-w-0">
                        <p className="text-slate-800 font-medium truncate">{item.product?.name}</p>
                        <p className="text-slate-400 text-xs">× {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-3">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Items</span>
                  <span className="font-semibold text-slate-800">{cartCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/15 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.97] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay ₹{subtotal.toLocaleString('en-IN')}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="h-3 w-3" />
                Secured by Razorpay · Test Mode
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
