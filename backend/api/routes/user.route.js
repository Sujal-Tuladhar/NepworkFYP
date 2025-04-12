import express from "express";
import { validate } from "../middleware/validate.js";
import User from "../models/user.model.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
export default router;
