const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const cors = require("cors");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any vercel/local origin
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Database connection helper for serverless resilience
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGO_URI) {
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);
};

// Ensure database connection is ready on incoming requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Configure API Router to handle endpoints under /api as well as root
const apiRouter = express.Router();
apiRouter.use("/customers", customerRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/wishlist", wishlistRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/orders", orderRoutes);

const { createPaymentOrder, verifyPayment } = require("./controllers/order.controller");
const { protect } = require("./middlewares/auth.middleware");

// Direct endpoints for standard checkout integration
apiRouter.post("/create-order", protect, createPaymentOrder);
apiRouter.post("/verify-payment", protect, verifyPayment);

apiRouter.get("/", (req, res) => {
  res.send("ShopKart API Service is running...");
});

// Mount on /api (for Vercel rewrites) and root (for backward compatibility and test scripts)
app.use("/api", apiRouter);
app.use(apiRouter);

app.get("/", (req, res) => {
  res.send("ShopKart Customer Authentication Service is running...");
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

module.exports = app;
