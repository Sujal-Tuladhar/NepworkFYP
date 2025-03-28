import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

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

export default router;
