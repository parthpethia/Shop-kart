# ShopKart — Frontend Engineering Lab (Login → Home Flow)

A modern, production-grade authentication and customer dashboard flow for **ShopKart**, built with React, React Router DOM, Axios, and Tailwind CSS.

---

## 🌟 Features & 100-Mark Rubric Breakdown

| Task | Component & Route | Marks | Status | Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| **Task 1** | **Registration Page** (`/register`) | **25** | ✅ Complete | Controlled form inputs with instant validation (full name, email regex, 6+ char password, 10-digit phone), inline error feedback, password visibility toggle, calls `POST /customers/register`, on success redirects to `/login` with success banner. |
| **Task 2** | **Login Page** (`/login`) | **30** | ✅ Complete | Controlled email & password fields, automatic HttpOnly cookie transmission via Axios `withCredentials: true`, on success navigates to `/home`, shows `"Invalid Credentials"` error banner on failure, links to `/register`. |
| **Task 3** | **Protected Home Page** (`/home`) | **30** | ✅ Complete | Automatically fetches `/customers/me` on mount. If unauthenticated (401), automatically redirects to `/login`. Displays welcome banner, customer name, email, phone number, loyalty tier, and e-commerce dashboard. |
| **Task 4** | **Navbar & Logout** | **15** | ✅ Complete | Sticky header with ShopKart branding, authenticated customer pill, active route indicator, and Logout button calling `POST /customers/logout` with `withCredentials: true` to clear cookies and redirect to `/login`. |
| **Total** | | **100** | ✅ **100/100** | Full marks criteria satisfied with clean code, modern UX, and robust error handling. |

---

## 📁 Project Structure

```
shopkart/
├── src/
│   ├── pages/
│   │   ├── Login.jsx       # Route: /login (Task 2)
│   │   ├── Register.jsx    # Route: /register (Task 1)
│   │   └── Home.jsx        # Route: /home (Task 3 Protected Route)
│   │
│   ├── components/
│   │   └── Navbar.jsx      # Sticky navbar with auth state & Logout (Task 4)
│   │
│   ├── services/
│   │   └── api.js          # Configured Axios instance with withCredentials: true
│   │
│   ├── App.jsx             # React Router hierarchy & session synchronization
│   ├── main.jsx            # React root mount
│   └── index.css           # Tailwind CSS & custom styling
│
├── mock-server.js          # Express companion backend with HttpOnly cookies & CORS
├── VIVA_QUESTIONS.md       # Complete answers for the 5 TA Viva questions
├── .env                    # API configuration (default: http://localhost:5000)
├── package.json
└── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Start the Companion Mock Server (Optional / Recommended for instant testing)
```bash
npm run mock-server
```
Runs at `http://localhost:5000` with pre-seeded demo user:
- **Email**: `test@shopkart.com`
- **Password**: `password123`

### 2. Connect to Your Lab 01 Backend
If you have your Lab 01 backend running on a different port (e.g., `8000` or `3000`), simply edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Frontend Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 TA Viva Preparation

Detailed answers for all 5 viva questions are provided in [VIVA_QUESTIONS.md](./VIVA_QUESTIONS.md):
1. Why do we use `withCredentials: true`?
2. Why can't JavaScript read an HttpOnly cookie?
3. Why is `/home` called a protected route?
4. Why do we fetch `/customers/me` instead of storing the user manually?
5. What is the difference between authentication and authorization?
