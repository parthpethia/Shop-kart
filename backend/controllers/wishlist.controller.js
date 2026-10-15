const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ============================================================================
// TASK 2: Add Product to Wishlist
// POST /wishlist/:productId
// ============================================================================
const addToWishlist = async (req, res) => {
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

    // Get authenticated user
    const customer = await Customer.findById(req.user._id);

    // Check for duplicate
    const alreadyInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    // Add product reference to wishlist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 3: Get Current User's Wishlist
// GET /wishlist
// ============================================================================
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 4: Remove Product from Wishlist
// DELETE /wishlist/:productId
// ============================================================================
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if product is actually in the wishlist
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your wishlist",
      });
    }

    // Remove product reference
    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
      error: error.message,
    });
  }
};

// ============================================================================
// BONUS: Toggle Wishlist
// PATCH /wishlist/:productId/toggle
// ============================================================================
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (index === -1) {
      // Not in wishlist → add it
      customer.wishlist.push(productId);
      saved = true;
    } else {
      // Already in wishlist → remove it
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved
        ? "Product added to wishlist"
        : "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while toggling wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
