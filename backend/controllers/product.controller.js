const mongoose = require("mongoose");
const Product = require("../models/product.model");

// ============================================================================
// TASK 2: Create Product
// POST /products
// ============================================================================
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation: Check if all required fields are provided
    if (!name || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, category, image) are required",
      });
    }

    // Validation: price must be provided and greater than 0
    if (price === undefined || price === null || typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price is required and must be a number greater than 0",
      });
    }

    // Validation: stock must be provided and cannot be negative
    if (stock === undefined || stock === null || typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock is required and must be a non-negative number",
      });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 3: Get All Products
// TASK 5: Search & Category Filtering + Bonus Sorting
// GET /products?search=keyword&category=Electronics&sort=price_asc
// ============================================================================
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query dynamically
    const query = {};

    // Search: case-insensitive partial match on product name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Category: exact match (case-insensitive)
    if (category) {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .select("name description price category image stock createdAt");

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 4: Get Single Product by ID
// GET /products/:id
// ============================================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
