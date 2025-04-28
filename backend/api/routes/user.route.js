import express from "express";
import { validate } from "../middleware/validate.js";
import User from "../models/user.model.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import { Bitmoro } from "bitmoro";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Bitmoro
const bitmoro = new Bitmoro(process.env.BITMORO_API_KEY);
const otpHandler = bitmoro.getOtpHandler(300, 6); // 5 minutes expiry, 6 digit OTP

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/getUser", validate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/editUser",
  validate,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { _id } = req.user;
      const { username, email, country, phone, desc, isSeller } = req.body;

      if (!_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Create update object
      const updateData = {
        username,
        email,
        country,
        phone,
        desc,
        isSeller,
      };

      // If a new profile picture was uploaded, add it to the update
      if (req.file) {
        updateData.profilePic = req.file.path;
      }

      const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
        new: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error in editUser:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.delete("/deleteUser", validate, async (req, res) => {
  try {
    const { _id } = req.user;

    if (!_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const deletedUser = await User.findByIdAndDelete(_id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/searchUsers",
  validate,
  asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    }).select("-password");
    res.status(200).json(users);
  })
);

router.get("/:userId", validate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// New route to send OTP for seller verification
router.post("/sendSellerOTP", validate, async (req, res) => {
  try {
    const { phone } = req.user;
    if (!phone) {
      return res.status(400).json({ message: "Phone number not found" });
    }

    const otp = otpHandler.registerOtp(req.user._id.toString());
    const message = `Your Nepwork seller verification OTP is ${otp.otp}. Valid for 5 minutes.`;

    const response = await otpHandler.sendOtpMessage(phone, message, "NEPWORK");

    res.status(200).json({
      message: "OTP sent successfully",
      status: response.status,
    });
  } catch (error) {
    console.error("Error in sendSellerOTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// New route to verify OTP and update seller status
router.post("/verifySellerOTP", validate, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id.toString();

    const isValid = otpHandler.verifyOtp(userId, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSeller: true },
      { new: true }
    );

    res.status(200).json({
      message: "Seller status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in verifySellerOTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

export default router;
