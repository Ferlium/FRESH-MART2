const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Register User Controller
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Check if email is missing
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if password is missing
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user" // Default to "user" if not provided
    });

    // Save the user to the database
    await newUser.save();

    // Send response with user details (excluding password)
    res.status(201).json({
      message: "User registered successfully!",
      newUser: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login User Controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid Credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });

     // Generate refresh token (valid for 7 days)
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Remove password before sending response
    const { password: _, ...userData } = user.toObject();

    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate Password Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.tokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send Reset Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password:\n\n
      http://localhost:7000/api/auth/reset-password/${resetToken}\n\n
      This link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent!" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    // Find user with valid reset token
    const user = await User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };