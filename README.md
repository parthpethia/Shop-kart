# 🛒 ShopKart — Modern Full-Stack E-Commerce Platform

ShopKart is a production-ready, full-stack e-commerce web application engineered with **React 19**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**, featuring end-to-end **Razorpay** payment gateway integration and **HttpOnly JWT** cookie-based session security.

---

## 🚀 Live Deployments

- **Backend API Service**: [https://shop-kart-2wru.onrender.com](https://shop-kart-2wru.onrender.com) (Hosted on Render)
- **Frontend Web App**: Configured for continuous deployment via [Vercel](https://vercel.com) with Edge API proxying

---

## ✨ Key Features

### 🔐 1. Authentication & Session Security
- **Cookie-Based Authentication**: Implements JSON Web Tokens (JWT) stored in secure, `HttpOnly`, `SameSite` cookies to protect against Cross-Site Scripting (XSS).
- **Registration & Validation**: Client-side and server-side validation for emails, strong passwords, and 10-digit mobile numbers with immediate visual feedback.
- **Session Synchronization**: Real-time authentication state restored via `/customers/me` on initial load and route changes.
- **Graceful Logout**: Secure server-side cookie clearance and client state cleanup.

### 🛍️ 2. Dynamic Product Catalog & Exploration
- **Product Filtering & Search**: Instant client-side search by title/description and multi-category filters (Electronics, Fashion, Home, Sports).
- **Stock Tracking & Status**: Dynamic indicators for inventory availability (*In Stock*, *Low Stock*, *Out of Stock*).
- **Product Details View**: Dedicated detail pages showcasing high-resolution imagery, pricing, descriptions, and category tags.

### ❤️ 3. Wishlist System
- **Quick Favorites**: One-click add/remove directly from product cards or product detail pages.
- **Reactive Badge Counters**: Navbar wishlist pill updates instantaneously across all open tabs and views.

### 🧺 4. Shopping Cart & State Management
- **Derived Values**: Real-time calculation of subtotal, tax/shipping, and discounts using React Context to prevent state synchronization anomalies.
- **Quantity Controls**: Increment, decrement, and remove items with stock-boundary clamping.
- **Cart Persistence**: Synchronized with the customer's persistent database document.

### 💳 5. Checkout & Razorpay Payment Integration
- **Order Creation**: Validates inventory stock and creates a cryptographically signed Razorpay order alongside a pending ShopKart order record.
- **Interactive Checkout SDK**: Launches Razorpay's modal checkout dialog supporting Cards, UPI, Net Banking, and Wallets.
- **Server-Side HMAC-SHA256 Verification**: Verifies payment signatures before finalizing orders:
  $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{KEY\_SECRET})$$
- **Atomic Stock Deduction**: Automatically deducts product stock levels upon payment success and empties the customer's cart.
- **Order History**: Dedicated dashboard displaying past orders, payment statuses (`PAID`, `PENDING`, `FAILED`), delivery details, and items purchased.

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   ShopKart Frontend                    │
│      React 19 • React Router v7 • Tailwind CSS • Vite   │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / Same-Origin API Proxy
               (/api/* via Vercel Edge Rewrites)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   ShopKart Backend                     │
│         Express 5 • Node.js • JWT • Cookie-Parser      │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│      MongoDB Atlas        │ │   Razorpay Payment API   │
│  Customers • Products •   │ │ Order Creation & Webhook │
│  Orders Collection        │ │ Signature Verification   │
└───────────────────────────┘ └──────────────────────────┘
```

### Technology Highlights
- **Frontend**: React 19, React Router DOM v7, Lucide Icons, Axios, Tailwind CSS v4, Vite 8.
- **Backend**: Node.js, Express, Mongoose 8, Razorpay SDK, JSONWebToken, Bcrypt.js, Cookie-Parser, CORS.
- **Database**: MongoDB (Atlas cloud cluster or local instance).

---

## 📂 Project Organization

```
Shop-kart/
├── backend/
│   ├── config/             # Database and Razorpay client initialization
│   ├── controllers/        # Request handlers (auth, cart, orders, products, wishlist)
│   ├── middlewares/        # JWT authentication & route protection middlewares
│   ├── models/             # Mongoose schemas (Customer, Product, Order)
│   ├── routes/             # Express API route declarations
│   ├── utils/              # Token generation and crypto verification helpers
│   ├── seed.js             # Automated database seeding script with sample products
│   ├── index.js            # Express application entrypoint
│   └── package.json        # Backend dependencies & scripts
│
├── src/
│   ├── assets/             # Logos, static assets, and banners
│   ├── components/         # Reusable UI components (Navbar, CartItem, ProductCard, etc.)
│   ├── context/            # React Context providers (CartContext for cart & wishlist state)
│   ├── pages/              # Application views (Home, Products, Cart, Checkout, Orders, Auth)
│   ├── services/           # Pre-configured Axios instance with credentials
│   ├── App.jsx             # Route definitions and application layout
│   └── main.jsx            # React root mount
│
├── vercel.json             # Edge proxy configuration routing /api to Render backend
├── vite.config.js          # Vite build and development server configuration
└── package.json            # Root frontend dependencies & build scripts
```

---

## 🔌 API Reference

### Authentication (`/api/customers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers/register` | Register a new customer account | No |
| `POST` | `/api/customers/login` | Authenticate customer and set HttpOnly token cookie | No |
| `POST` | `/api/customers/logout` | Clear authentication cookie | Yes |
| `GET` | `/api/customers/me` | Fetch authenticated customer profile | Yes |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all active products (supports category filter) | No |
| `GET` | `/api/products/:id` | Retrieve single product details by ID | No |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Retrieve authenticated customer's wishlist items | Yes |
| `POST` | `/api/wishlist/add/:productId` | Add a product to customer's wishlist | Yes |
| `DELETE` | `/api/wishlist/remove/:productId` | Remove a product from wishlist | Yes |

### Shopping Cart (`/api/cart`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current customer's cart items with product details | Yes |
| `POST` | `/api/cart/add` | Add product to cart (body: `{ productId, quantity }`) | Yes |
| `PUT` | `/api/cart/update` | Update item quantity (body: `{ productId, quantity }`) | Yes |
| `DELETE` | `/api/cart/remove/:productId` | Remove product from cart | Yes |
| `DELETE` | `/api/cart/clear` | Empty customer's cart | Yes |

### Orders & Payments (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/create-payment-order` | Validate stock & create Razorpay order | Yes |
| `POST` | `/api/orders/verify-payment` | Verify HMAC-SHA256 signature & mark order PAID | Yes |
| `GET` | `/api/orders/my-orders` | List order history for current customer | Yes |
| `GET` | `/api/orders/:id` | Get individual order details | Yes |

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- (Optional) Free [Razorpay Test Account](https://razorpay.com) for payment testing

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NODE_ENV=development
   ```
3. Populate database with sample products:
   ```bash
   node seed.js
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

### 3. Frontend Setup
1. In another terminal, navigate to the project root:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

---

## 🌐 Production Deployment

### Backend (Render)
- **Service Type**: Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Add `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NODE_ENV=production`.

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Reverse Proxy**: [vercel.json](./vercel.json) routes all `/api/*` traffic automatically to the live Render backend, ensuring seamless cross-site cookie and authentication flow without browser restrictions.
