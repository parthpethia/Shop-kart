# 🎓 ShopKart Engineering Labs (Week 3 to Week 6)
## Comprehensive Technical Documentation & TA Viva Preparation Guide

---

## ⚡ Quick Fix: Port 5000 `EADDRINUSE` Error

When you see:
```text
Error: listen EADDRINUSE: address already in use :::5000
```
It means a previous background Node/Nodemon process is still listening on port 5000. Run this in PowerShell to terminate it:

```powershell
# Kill the process occupying port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Then restart backend cleanly:
cd backend
npm run dev
```

---

## 🗺️ Architectural Progression: Week 3 to Week 6

```
Week 3: Catalog & Browsing
├── Products Model & Pagination / Category Filters / Price Sorting
├── Product Details & Stock Indicators
└── Frontend Catalog UI (/products, /products/:id)

Week 4: Wishlist System (Lab 04)
├── "Save for later" intent
├── MongoDB 1:N relationship (User embedding wishlist array of ObjectIds)
├── Protected Endpoints (/wishlist, /wishlist/:productId)
└── Intentionally NO global state (local state + direct backend calls)

Week 5: Shopping Cart System (Lab 05)
├── "Intent to buy" with quantities and stock constraints
├── React Context API (CartProvider) + derived totals
├── MongoDB Cart items with populated product metadata
└── Server Sync & Optimistic UI updates

Week 6: Checkout, Payment & Orders (Lab 06)
├── Converting volatile Cart into an immutable, persistent Order
├── Razorpay Test Gateway integration + HMAC SHA256 signature verification
├── Product snapshotting (price freezes against future catalog changes)
└── Post-payment lifecycle: Cart clearing, status transitions, My Orders history
```

---

# 📦 WEEK 3: Product Catalog, Details & Discovery

### 🎯 Objective & What Was Built
1. **Product Schema (`product.model.js`)**:
   - `name`, `description`, `price`, `category`, `image`, `stock`, `rating`, `brand`.
2. **Catalog Filtering & Pagination**:
   - `GET /products` supporting `?category=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?sort=price_asc|price_desc`.
   - `GET /products/:id` with 404 safety if an invalid ObjectId is queried.
3. **Frontend Components**:
   - [Products.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/Products.jsx): Responsive grid, active filters, search debounce, category chips, stock badges.
   - [ProductDetails.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/ProductDetails.jsx): Image gallery preview, detailed specs, add-to-cart & wishlist toggle buttons with stock check.

---

### ❓ Week 3 TA Viva Questions & Answers

#### Q1: Why do we perform sorting and filtering in the MongoDB database query rather than in JavaScript on the frontend?
> **Answer:** Scalability and performance. In a production catalog with 100,000 products, sending the entire dataset to the browser to filter in JS wastes server bandwidth, spikes client memory, and degrades user device responsiveness. Doing it in MongoDB via `$match`, `$sort`, and `$limit` leverages database indexes (`B-Tree`), executing in milliseconds with minimal network payload.

#### Q2: How do you handle invalid MongoDB `_id` strings passed in `req.params.id` without crashing the Express server?
> **Answer:** We validate using `mongoose.Types.ObjectId.isValid(id)`. If false, we immediately return `400 Bad Request` or `404 Not Found` before executing `Product.findById(id)`. Without this check, Mongoose throws a `CastError`, which unhandled would lead to a `500 Internal Server Error`.

#### Q3: What is the purpose of database seeding (`seed.js`)?
> **Answer:** Seeding populates a fresh or test database with deterministic mock data (categories, pricing, stock levels, images) so development and automated tests run reliably without manual data entry.

---

# ❤️ WEEK 4: Wishlist Experience (Lab 04)

### 🎯 Objective & What Was Built
1. **User-Wishlist Relationship**:
   - Stored on the `Customer` document as an array of referenced ObjectIds: `wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]`.
2. **Backend API Endpoints (`wishlist.routes.js`, `wishlist.controller.js`)**:
   - `GET /wishlist`: Protected by JWT auth middleware; returns populated product objects.
   - `POST /wishlist/:productId`: Adds product to wishlist using `$addToSet` (prevents duplicate entries).
   - `DELETE /wishlist/:productId`: Removes product using `$pull`.
3. **No Global State Constraint**:
   - The lab strictly prohibited Redux/Context for the Wishlist to demonstrate raw backend persistence. The UI directly triggers HTTP requests and updates local component state (`useState`).
4. **Frontend UI**:
   - [Wishlist.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/Wishlist.jsx): Heart icon toggle, empty state with "Browse Products", and "Move to Cart" button.

---

### ❓ Week 4 TA Viva Questions & Answers

#### Q1: Why did we use `$addToSet` instead of `$push` when adding a product to the wishlist array?
> **Answer:** `$push` will append the item regardless of whether it already exists, resulting in duplicate wishlist entries. `$addToSet` treats the MongoDB array like a mathematical set—it only adds the `productId` if it is not already present, ensuring idempotency without needing a manual query check first.

#### Q2: Why is the Wishlist considered a 1:N relationship and why did we embed IDs in the User document instead of creating a separate Wishlist collection?
> **Answer:** A customer typically has one wishlist with a modest number of items (< 200). Embedding an array of `ObjectId` references inside the `Customer` document avoids an extra collection join, maintains data locality, and adheres to the 16MB document size limit easily.

#### Q3: Why was global state (Context/Redux) banned in Lab 04?
> **Answer:** To test the student's understanding of **backend persistence**. If students only update an in-memory Redux store, the wishlist disappears on page refresh or across devices. By enforcing direct API calls and local state synchronization, the backend remains the single source of truth.

---

# 🛒 WEEK 5: Shopping Cart State & Synchronization (Lab 05)

### 🎯 Objective & What Was Built
1. **Cart Schema & Structure**:
   - In `customer.model.js`:
     ```javascript
     cart: [{
       product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
       quantity: { type: Number, required: true, min: 1, default: 1 }
     }]
     ```
2. **Context API (`CartContext.jsx`)**:
   - Provides global access to: `cartItems`, `addToCart()`, `updateQuantity()`, `removeFromCart()`, `clearCart()`, `loading`, and derived totals.
   - Computes **derived state** in real time:
     - `subtotal = sum(item.product.price * item.quantity)`
     - `tax = subtotal * 0.18` (18% GST)
     - `shipping = subtotal > 1000 ? 0 : 99`
     - `total = subtotal + tax + shipping`
3. **Backend Validation Rules**:
   - Checks `product.stock` before incrementing quantity.
   - Throws `400 Bad Request` if requested quantity exceeds available stock.
4. **Frontend UI**:
   - [Cart.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/Cart.jsx): Dynamic quantity increment/decrement, line-item removal, real-time cost breakdown, free shipping threshold progress bar, and "Proceed to Checkout" link.

---

### ❓ Week 5 TA Viva Questions & Answers

#### Q1: Why should `subtotal`, `tax`, and `total` NEVER be stored in the database Cart document or in React `useState`?
> **Answer:** They are **derived values**. Storing them creates data redundancy and potential state divergence (e.g., quantity changes in state, but subtotal update fails or lags). Deriving them directly during render (`cartItems.reduce(...)`) ensures 100% mathematical consistency without risk of stale state.

#### Q2: What is an Optimistic UI update, and how does the Cart use it?
> **Answer:** In an optimistic update, the frontend immediately updates its UI (e.g., increments quantity badge) before the server response arrives, making the app feel instantaneous. If the server responds with an error (e.g., out of stock), the frontend rolls back the state to the previous snapshot and displays an alert.

#### Q3: How do you handle race conditions when a user rapidly clicks the "+" button 5 times?
> **Answer:** We can handle it via:
> 1. Disabling the button while the in-flight API call is pending.
> 2. Debouncing the API update so only the final quantity is dispatched.
> 3. Backend atomic updates (`$inc`) with a conditional check `{ _id: userId, 'cart.quantity': { $lt: productStock } }`.

---

# 💳 WEEK 6: Checkout, Orders & Razorpay Payment (Lab 06)

### 🎯 Objective & What Was Built
1. **Order Model (`order.model.js`)**:
   - **Product Snapshot**: Stores `productId`, `name`, `price`, `quantity`, `image` directly at the time of purchase.
   - **Shipping Address**: `fullName`, `addressLine`, `city`, `state`, `pincode` (6-digit regex), `phone`.
   - **Payment Info**: `paymentMethod` ('RAZORPAY'), `paymentStatus` ('PENDING', 'PAID', 'FAILED'), `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.
   - **Order Status**: `'PLACED'`, `'PROCESSING'`, `'SHIPPED'`, `'DELIVERED'`, `'CANCELLED'`.
2. **Order Controller (`order.controller.js`)**:
   - `POST /orders/create-payment-order`: Validates shipping address and cart items, checks real-time inventory, calculates final server-side amount, creates a `PENDING` order in DB, and calls Razorpay API to generate a `razorpay_order_id`.
   - `POST /orders/verify-payment`: Verifies Razorpay HMAC SHA256 signature. If valid:
     - Marks order `PAID` & `PLACED`.
     - Decrements product inventory stock.
     - **Clears customer's cart** in MongoDB.
   - `GET /orders/my-orders`: Returns all customer orders sorted newest first (`-createdAt`).
   - `GET /orders/:id`: Returns single order details with ownership verification (`order.customer == req.user._id`).
3. **Frontend Integration**:
   - [Checkout.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/Checkout.jsx): Dynamic Razorpay checkout script injection, form validation, triggers Razorpay modal.
   - [OrderSuccess.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/OrderSuccess.jsx): Confirmation screen with order summary and receipt.
   - [Orders.jsx](file:///c:/Users/Atul/OneDrive/Desktop/SST%20Coding/Lab/Shopkart(week%201)/src/pages/Orders.jsx): Order history, delivery timeline step-indicator, item cards.

---

### ❓ Week 6 TA Viva Questions & Answers

#### Q1: Why do we snapshot product price and name inside the `Order` document instead of just saving `productId` references?
> **Answer:** **Immutability of financial transactions.** If a merchant changes a product's price from ₹500 to ₹1,000 next month, or deletes the product entirely, past invoices must still accurately reflect what the customer paid at checkout (₹500). Referencing alone would retroactively corrupt past order totals.

#### Q2: How does Razorpay Payment Verification work, and why must it be verified on the backend?
> **Answer:** Razorpay signs the payload using HMAC SHA256:
> ```javascript
> const expectedSignature = crypto
>   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
>   .update(razorpay_order_id + '|' + razorpay_payment_id)
>   .digest('hex');
> ```
> If the frontend could verify payment, a malicious user could inspect network traffic and send a fake "Payment Success" status to the server without actually paying. Because only the backend and Razorpay know `RAZORPAY_KEY_SECRET`, the signature cannot be forged.

#### Q3: When should the user's cart be cleared: before opening Razorpay, or after verification?
> **Answer:** **Strictly AFTER signature verification.** If you clear the cart when opening the payment modal and the customer cancels or their card fails, their cart is lost, causing user frustration. By clearing the cart only upon confirmed payment, failed attempts allow the user to retry with their items intact.

#### Q4: Why must the order amount passed to Razorpay be calculated on the backend rather than accepted from the frontend?
> **Answer:** Security. A client could tamper with the HTTP request payload and change `amount: 10000` to `amount: 1` (paying 1 rupee for a 10,000 rupee order). The backend must read the items from the database, compute `price * quantity`, and generate the Razorpay order using its own calculated total.

#### Q5: In Razorpay, why is the amount multiplied by 100?
> **Answer:** Razorpay API expects the amount in the smallest currency sub-unit (paise for INR, cents for USD) to avoid floating-point rounding inaccuracies in financial transactions. Thus ₹499.00 is passed as `49900`.

---

## 📊 Summary Comparison Cheat Sheet for TA Viva

| Feature | Wishlist (Lab 04) | Shopping Cart (Lab 05) | Orders (Lab 06) |
|---|---|---|---|
| **User Intent** | Save for later / casual interest | Active intent to purchase | Legally binding purchase |
| **Quantity?** | No (Boolean presence) | Yes (`quantity >= 1` with stock limits) | Fixed historical snapshot |
| **Price Stored?** | No (Always references current product price) | No (Dynamically calculated from product doc) | **Yes (Snapshotted price at transaction time)** |
| **State Scope** | Component Local State | Global React Context | Server-driven async lifecycle |
| **Data Lifecycle** | Persistent until explicitly removed | Volatile (transferred/cleared at checkout) | **Permanent immutable audit record** |
| **Auth Requirement**| JWT Protected | JWT Protected | JWT Protected + Ownership Verified |
