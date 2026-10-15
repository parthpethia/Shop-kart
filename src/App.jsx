import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Silently check active session on initial application load
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await api.get('/customers/me');
        if (isMounted) {
          const customer = response.data.customer || response.data.user || response.data;
          setUser(customer);
        }
      } catch (err) {
        // No active cookie session or unauthorized - perfectly normal on fresh visit
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = useCallback((customerData) => {
    setUser(customerData);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  const handleUserLoaded = useCallback((customerData) => {
    setUser((prev) => {
      if (
        prev &&
        customerData &&
        prev._id === customerData._id &&
        prev.email === customerData.email
      ) {
        return prev;
      }
      return customerData;
    });
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Loading ShopKart...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CartProvider user={user}>
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
          {/* Persistent Sticky Navbar with auth state and logout (Task 4) */}
          <Navbar user={user} onLogout={handleLogout} />

          {/* Main Content View with React Router */}
          <main className="flex-1">
            <Routes>
              {/* Task 1: Registration Page */}
              <Route path="/register" element={<Register />} />

              {/* Task 2: Login Page */}
              <Route 
                path="/login" 
                element={<Login onLoginSuccess={handleLoginSuccess} />} 
              />

              {/* Task 3: Protected Home Page */}
              <Route 
                path="/home" 
                element={<Home currentUser={user} onUserLoaded={handleUserLoaded} />} 
              />

              {/* Lab 03: Product Listing Page */}
              <Route path="/products" element={<Products />} />

              {/* Lab 03: Product Details Page */}
              <Route path="/products/:id" element={<ProductDetails />} />

              {/* Lab 04: Wishlist Page */}
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Lab 05: Cart Page */}
              <Route path="/cart" element={<Cart />} />

              {/* Lab 06: Checkout Page */}
              <Route path="/checkout" element={<Checkout />} />

              {/* Lab 06: Order Success Page */}
              <Route path="/order-success/:id" element={<OrderSuccess />} />

              {/* Lab 06: My Orders Page */}
              <Route path="/orders" element={<Orders />} />

              {/* Default Route: Redirect to /home */}
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* 404 Not Found fallback */}
              <Route
                path="*"
                element={
                  <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
                    <p className="mt-2 text-lg font-semibold text-slate-800">Page not found</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      The page you are looking for does not exist or has moved.
                    </p>
                    <a
                      href="/home"
                      className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
                    >
                      Return to Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
