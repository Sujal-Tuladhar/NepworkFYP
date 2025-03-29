import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import { generateOTP } from "../utils/base.js";
import { sendMail } from "../utils/mailer.js";
const router = express.Router();
const passwordMap = new Map(); // Store OTPs temporarily

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
    console.error("Registration Error:", err);
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

export default router;
