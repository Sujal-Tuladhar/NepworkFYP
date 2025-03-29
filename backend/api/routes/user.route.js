import express from "express";
import { validate } from "../middleware/validate.js";
import User from "../models/user.model.js";

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

router.put("/editUser", validate, async (req, res) => {
  try {
    const { _id } = req.user;
    const { username, email, profilePic, country, phone, desc, isSeller } =
      req.body;

    if (!_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        username,
        email,
        profilePic,
        country,
        phone,
        desc,
        isSeller,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in editUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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

export default router;
