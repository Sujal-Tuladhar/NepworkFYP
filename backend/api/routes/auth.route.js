import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import { generateOTP } from "../utils/base.js";
import { sendMail } from "../utils/mailer.js";
const router = express.Router();
const passwordMap = new Map(); // Store OTPs temporarily
const registrationOTPMap = new Map(); // Store registration OTPs

router.post("/register", async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hash = bcrypt.hashSync(req.body.password, 5);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(createError(404, "User not found"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) return next(createError(401, "Invalid credentials"));

    //Generate JWT Token
    const token = jwt.sign(
      {
        _id: user._id,
        // isSeller: user.isSeller
      },
      process.env.JWT_KEY,
      { expiresIn: "7d" } // Optional: Token expires in 7 days
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true, // Prevents JavaScript access (protects from XSS attacks)
        secure: process.env.NODE_ENV === "production", // Only secure in production (HTTPS)
        sameSite: "Strict", // Prevents CSRF attacks by restricting cookie access
      })
      .status(200)
      .json({ message: "Login successful", user: info, token });
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    // Store OTP with user email
    passwordMap.set(email, otp);
    console.log("OTP:", otp);

    const mailOptions = {
      from: process.env.GMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
    };

    await sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = passwordMap.get(email);

    if (!storedOTP) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid, allow password reset
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const hash = bcrypt.hashSync(newPassword, 5);

    // Update user's password
    user.password = hash;
    await user.save();

    // Clear the OTP
    passwordMap.delete(email);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Password Reset Error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "User has been logged out. " });
});

// Admin login route
router.post("/admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    const user = await User.findOne({ email });

    console.log(user);

    if (!user) return next(createError(404, "User not found"));

    console.log(user);

    // Check if user is an admin
    if (!user.isAdmin) return next(createError(403, "Not authorized as admin"));

    const isCorrect = bcrypt.compareSync(password, user.password);
    if (!isCorrect) return next(createError(401, "Invalid credentials"));

    // Generate JWT Token with admin flag
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    const { password: pass, ...info } = user._doc;

    console.log(info);

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .status(200)
      .json({
        ...info,
        accessToken: token,
        message: "Admin login successful",
      });
  } catch (err) {
    console.error("Admin Login Error:", err);
    next(err);
  }
});

router.post("/send-registration-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOTP();
    registrationOTPMap.set(email, otp);
    console.log("Registration OTP:", otp);

    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: "Registration Verification OTP",
      text: `Your OTP for registration is: ${otp}. This OTP will expire in 10 minutes.`,
    };

    await sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send Registration OTP Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-registration-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = registrationOTPMap.get(email);

    if (!storedOTP) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear the OTP after successful verification
    registrationOTPMap.delete(email);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify Registration OTP Error:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

export default router;
