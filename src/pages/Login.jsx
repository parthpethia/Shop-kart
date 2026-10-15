import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Controlled form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for prefilled data or success message passed via navigation state (e.g. from /register)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
    }
    if (location.state?.prefilledEmail) {
      setFormData((prev) => ({ ...prev, email: location.state.prefilledEmail }));
    }
  }, [location.state]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }

    if (loginError) setLoginError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Task 2 — Login API Integration (30 Marks)
   * Calls POST /customers/login
   * Cookies are automatically handled via Axios withCredentials: true.
   * On success -> Navigates to /home.
   * On failure -> Displays "Invalid Credentials".
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post('/customers/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Extract customer or fetch profile if missing so state is fully primed
      let customer = response.data?.customer || response.data?.user;
      if (!customer || !customer.email) {
        try {
          const profileRes = await api.get('/customers/me');
          customer = profileRes.data?.customer || profileRes.data?.user || profileRes.data;
        } catch {
          // Home will handle any auth errors
        }
      }

      // Notify parent app of successful login with customer payload
      if (onLoginSuccess && customer) {
        onLoginSuccess(customer);
      }

      // Requirement: On success → Navigate to /home
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      /**
       * Requirement: Show "Invalid Credentials" on failure
       */
      const status = err.response?.status;
      const apiMsg = err.response?.data?.message || err.response?.data?.error;

      if (status === 401 || status === 400 || (apiMsg && apiMsg.toLowerCase().includes('credential')) || !apiMsg) {
        setLoginError('Invalid Credentials');
      } else {
        setLoginError(apiMsg || 'Invalid Credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 auth-gradient-bg">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="glass-panel overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-inner">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Log in to your ShopKart account to manage orders and track deliveries.
            </p>
          </div>

          {/* Success Banner (e.g. redirected from register) */}
          {successMessage && (
            <div 
              id="login-success-banner"
              className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 animate-fade-in"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Error Banner: Requirement: Show "Invalid Credentials" on failure */}
          {loginError && (
            <div 
              id="login-error-banner"
              data-testid="login-error-banner"
              className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fade-in"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Authentication Failed</p>
                <p id="login-error-message" data-testid="login-error-message" className="text-xs text-rose-700 mt-0.5 font-medium">{loginError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  data-testid="email-input"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm transition-all outline-none ${
                    errors.email && touched.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 bg-slate-50/50 text-slate-900 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <p id="error-email" data-testid="error-email" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  data-testid="password-input"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border pl-10 pr-11 py-2.5 text-sm transition-all outline-none ${
                    errors.password && touched.password
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 bg-slate-50/50 text-slate-900 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p id="error-password" data-testid="error-password" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-button"
                data-testid="login-button"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/35 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer switch to Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                id="link-to-register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-3.5 backdrop-blur-sm text-center shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">
            <span className="font-semibold text-indigo-600">💡 Testing tip:</span> You can register a new account on <Link to="/register" className="text-indigo-600 underline">/register</Link> or use demo: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">test@shopkart.com</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">password123</code>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
