const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");


const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation: Check if all fields are provided
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields (fullName, email, password, phone) are required",
      });
    }

    // 2. Validation: Check password length (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    // 3. Validation: Check if customer with this email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // 4. Hash the password using bcrypt before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create and save new customer
    const newCustomer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // 6. Return success response (never include password)
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 2: Login Customer
// POST /customers/login
// ============================================================================
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      // Do not reveal whether email or password was wrong
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 3. Compare entered password with stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, customer.password);
    if (!isPasswordMatch) {
      // Do not reveal whether email or password was wrong
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT and store inside an HttpOnly cookie
    generateToken(res, customer._id);

    // 5. Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 3: My Profile
// GET /customers/me
// ============================================================================
const getProfile = async (req, res) => {
  try {
    // req.user is attached by the auth.middleware.js
    const customer = req.user;

    return res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error fetching profile",
      error: error.message,
    });
  }
};

// ============================================================================
// TASK 4: Logout
// POST /customers/logout
// ============================================================================
const logoutCustomer = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during logout",
      error: error.message,
    });
  }
};

// ============================================================================
// BONUS CHALLENGE: Change Password (+10 Marks)
// PATCH /customers/change-password
// ============================================================================
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must contain at least 6 characters",
      });
    }

    // 2. Fetch customer with password included
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // 3. Verify old password
    const isOldMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isOldMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
      });
    }

    // 4. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 5. Save updated password
    customer.password = hashedNewPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error changing password",
      error: error.message,
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
};
