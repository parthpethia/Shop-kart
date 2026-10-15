const mongoose = require("mongoose");
const crypto = require("crypto");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// ============================================================================
// TASK 4: Create Payment Order
// POST /orders/create-payment-order
// ============================================================================
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress, amount: directAmount, currency = "INR", receipt } = req.body;

    // Support direct amount request (e.g. { amount: 50000, currency: "INR", receipt: "rcpt_1" })
    if (directAmount !== undefined && !shippingAddress) {
      const amountPaise = Number(directAmount);
      if (isNaN(amountPaise) || amountPaise < 100) {
        return res.status(400).json({
          success: false,
          message: "Minimum amount is 100 paise",
        });
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amountPaise),
        currency: currency || "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
      });

      return res.status(201).json({
        success: true,
        order_id: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    // ---- Validate shipping address ----
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredFields) {
      if (
        !shippingAddress[field] ||
        shippingAddress[field].toString().trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `Shipping address field '${field}' is required`,
        });
      }
    }

    // Validate phone format
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(shippingAddress.phone.replace(/\s/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain at least 10 digits",
      });
    }

    // Validate pincode format
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    // ---- Load user's cart ----
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before checkout.",
      });
    }

    // ---- Load latest product data & validate stock ----
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product no longer available (ID: ${cartItem.product})`,
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`,
        });
      }

      // Build order snapshot with current product data
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      // Server-side total calculation — never trust frontend
      totalAmount += product.price * cartItem.quantity;
    }

    const amountInPaise = Math.round(totalAmount * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum order amount is 100 paise",
      });
    }

    // ---- Create ShopKart pending order ----
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // ---- Create Razorpay Order ----
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise, // INR → paise
      currency: "INR",
      receipt: order._id.toString(),
    });

    // Save Razorpay Order ID to our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // ---- Return checkout data (key ID is safe, key SECRET is never sent) ----
    return res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      shopKartOrderId: order._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 5: Verify Payment & Complete Order
// POST /orders/verify-payment
// ============================================================================
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      order_id,
      razorpay_order_id,
      payment_id,
      razorpay_payment_id,
      signature,
      razorpay_signature,
    } = req.body;

    const rzpOrderId = razorpay_order_id || order_id;
    const rzpPaymentId = razorpay_payment_id || payment_id;
    const rzpSignature = razorpay_signature || signature;

    if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters (order_id, payment_id, signature required)",
      });
    }

    // Find the ShopKart order if shopKartOrderId is provided
    let order = null;
    if (shopKartOrderId) {
      order = await Order.findById(shopKartOrderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Verify ownership if authenticated user is present
      if (req.user && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to this order",
        });
      }
    }

    // ---- Verify Razorpay signature using HMAC SHA256 ----
    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const trustedOrderId = (order && order.razorpayOrderId) ? order.razorpayOrderId : rzpOrderId;
    const body = trustedOrderId + "|" + rzpPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== rzpSignature) {
      if (order) {
        order.paymentStatus = "FAILED";
        await order.save();
      }

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed.",
      });
    }

    // ---- Signature valid → Mark order as PAID ----
    if (order) {
      order.paymentStatus = "PAID";
      order.status = "PLACED";
      order.razorpayPaymentId = rzpPaymentId;
      await order.save();

      // ---- Deduct stock ----
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // ---- Clear user's cart ONLY after successful verification ----
      if (req.user) {
        const customer = await Customer.findById(req.user._id);
        if (customer) {
          customer.cart = [];
          await customer.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order placed!",
      order: order || undefined,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 7: Get Current User's Orders
// GET /orders
// ============================================================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// ============================================================================
// Get Single Order
// GET /orders/:id
// ============================================================================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check — users can only access their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This order belongs to another user.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
      error: error.message,
    });
  }
};

// ============================================================================
// BONUS: Update Order Status (admin/dev endpoint)
// PATCH /orders/:id/status
// ============================================================================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING_PAYMENT",
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
