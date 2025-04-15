import express from "express";
import { validate } from "../middleware/validate.js";
import asyncHandler from "express-async-handler";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
const router = express.Router();

router.post(
  "/sendMessage",
  validate,
  asyncHandler(async (req, res, next) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res
        .status(400)
        .json({ message: "Invalid Data Passed Into Request." });
    }
    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
    try {
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
      await Chat.findByIdAndUpdate(req.params.chatId, {
        latestMessage: message,
      });
      res.json(message);
    } catch (error) {
      return res.status(400).json({ message: error.message });
      console.log("Error Backend Catch", error.message);
    }
  })
);

router.get(
  "/allMessage/:chatId",
  validate,
  asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

export default router;
