const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const { protect } = require("../middlewares/auth.middleware");

// All cart routes are protected
router.use(protect);

// GET /cart — Get current user's cart
router.get("/", getCart);

// POST /cart/:productId — Add product to cart
router.post("/:productId", addToCart);

// PATCH /cart/:productId — Update quantity
router.patch("/:productId", updateCartQuantity);

// DELETE /cart/:productId — Remove from cart
router.delete("/:productId", removeFromCart);

module.exports = router;
