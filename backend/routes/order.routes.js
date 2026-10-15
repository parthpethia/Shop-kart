const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const { protect } = require("../middlewares/auth.middleware");

// All order routes are protected
router.use(protect);

// POST /orders/create-payment-order — Create pending order + Razorpay order
router.post("/create-payment-order", createPaymentOrder);

// POST /orders/verify-payment — Verify Razorpay signature & confirm order
router.post("/verify-payment", verifyPayment);

// GET /orders — Get current user's orders
router.get("/", getOrders);

// GET /orders/:id — Get single order (ownership enforced)
router.get("/:id", getOrderById);

// PATCH /orders/:id/status — Bonus: Update order status
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
