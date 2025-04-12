import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User", // Could be the one who initiated the chat
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
