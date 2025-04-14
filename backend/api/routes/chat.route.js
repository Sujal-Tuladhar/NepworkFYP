import express from "express";
import { validate } from "../middleware/validate.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
const router = express.Router();

router.route("/accessChat").post(
  validate,
  asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID param not sent with request." });
    }

    try {
      let isChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] },
      })
        .populate("users", "-password")
        .populate("latestMessage");

      if (isChat) {
        isChat = await User.populate(isChat, {
          path: "latestMessage.sender",
          select: "name profilePic email",
        });
        return res.send(isChat);
      }

      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      return res.status(200).json(fullChat);
    } catch (error) {
      console.error("AccessChat error:", error);
      return res.status(500).json({ message: "Failed to access chat." });
    }
  })
);

router.get(
  "/fetchChat",
  validate,
  asyncHandler(async (req, res) => {
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name profilePic email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

router.post(
  "/create-group",
  validate,
  asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please fill all the fields" });
    }
    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res.status(400).send({
        message: "More than 2 users are required to form a group chat",
      });
    }
    users.push(req.user);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);
router.put(
  "/rename-group",
  validate,
  asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    } else {
      res.status(200).json(updatedChat);
    }
  })
);
router.put(
  "/group-add",
  validate,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const addedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!addedChat) {
      return res.status(404).json({ message: "User not added found" });
    } else {
      res.status(200).json(addedChat);
    }
  })
);
router.put(
  "/remove-group",
  validate,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removeMember = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removeMember) {
      return res.status(404).json({ message: "User not added found" });
    } else {
      res.status(200).json(removeMember);
    }
  })
);

export default router;
