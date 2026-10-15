const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ============================================================================
// TASK 2: Add Product to Cart
// POST /cart/:productId
// ============================================================================
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if product is already in cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    let newQuantity;
    if (existingItem) {
      // Product already in cart — increase quantity by 1
      newQuantity = existingItem.quantity + 1;
    } else {
      // New item — quantity will be 1
      newQuantity = 1;
    }

    // Validate stock availability
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Return populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 3: Get Current User's Cart
// GET /cart
// ============================================================================
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    // Filter out cart items where the product may have been deleted
    const validCart = customer.cart.filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 4: Update Product Quantity
// PATCH /cart/:productId
// ============================================================================
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Validate quantity
    if (quantity === undefined || typeof quantity !== "number") {
      return res.status(400).json({
        success: false,
        message: "Quantity is required and must be a number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Find the cart item
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your cart",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await customer.save();

    // Return populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 5: Remove Product from Cart
// DELETE /cart/:productId
// ============================================================================
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your cart",
      });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    // Return populated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while removing from cart",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
