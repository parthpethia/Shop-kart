/**
 * Seed Script — Populate MongoDB with sample products
 * Run: node backend/seed.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const Product = require("./models/product.model");

const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and premium comfort cushions for an immersive audio experience.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches, programmable macros, and aircraft-grade aluminium body. Perfect for gamers and developers.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    stock: 10,
  },
  {
    name: "Ultra-Slim Laptop Stand",
    description: "Ergonomic aluminium laptop stand with adjustable height, heat dissipation design, and foldable construction for easy portability.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    stock: 40,
  },
  {
    name: "Premium Cotton T-Shirt",
    description: "100% organic cotton crew-neck t-shirt with a relaxed fit. Available in multiple colors. Machine washable and pre-shrunk.",
    price: 799,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    stock: 100,
  },
  {
    name: "Classic Denim Jacket",
    description: "Vintage-inspired denim jacket with button closure, chest pockets, and a comfortable regular fit. A timeless wardrobe essential.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80",
    stock: 15,
  },
  {
    name: "Running Sneakers",
    description: "Lightweight mesh running shoes with responsive cushioning, breathable upper, and durable rubber outsole for daily training.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    stock: 30,
  },
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel. One of the best-selling personal finance books of the decade.",
    price: 349,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    stock: 60,
  },
  {
    name: "Atomic Habits",
    description: "An easy and proven way to build good habits and break bad ones by James Clear. Over 10 million copies sold worldwide.",
    price: 399,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    stock: 45,
  },
  {
    name: "Minimalist Desk Lamp",
    description: "Touch-controlled LED desk lamp with 5 brightness levels, adjustable arm, USB charging port, and a sleek modern design.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80",
    stock: 20,
  },
  {
    name: "Scented Soy Candle Set",
    description: "Set of 3 hand-poured soy wax candles with natural essential oils. Includes lavender, vanilla, and eucalyptus fragrances.",
    price: 599,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602607556838-c389d0bfba89?w=600&q=80",
    stock: 35,
  },
  {
    name: "Wireless Bluetooth Speaker",
    description: "Portable waterproof Bluetooth speaker with 360° surround sound, 12-hour battery life, and built-in microphone for hands-free calls.",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    stock: 0,
  },
  {
    name: "Yoga Mat Premium",
    description: "Extra-thick 6mm non-slip yoga mat with alignment lines, eco-friendly TPE material, and carrying strap included.",
    price: 899,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
    stock: 50,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    inserted.forEach((p) => {
      console.log(`  ✓ ${p.name} (${p.category}) — ₹${p.price}`);
    });

    await mongoose.connection.close();
    console.log("\nDatabase connection closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedProducts();
