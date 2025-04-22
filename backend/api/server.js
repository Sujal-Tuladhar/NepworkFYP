import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRoutes from "./routes/test.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import gigRoutes from "./routes/gig.route.js";
import reviewRoutes from "./routes/review.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import adminRoutes from "./routes/admin.route.js";
import chats from "./utils/data.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import escrowRoutes from "./routes/escrow.route.js";
import projectRoutes from "./routes/project.route.js";
import { Server } from "socket.io";
import bidRoutes from "./routes/bid.route.js";
import http from "http";

dotenv.config();
const app = express();
//Conencting Frontend to backend #Credinatial true allows to send the cookies,tokens
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
// Parses JSON request bodies into req.body.
app.use(express.json());
// Parses cookies into req.cookies.
app.use(cookieParser());

//Connecting mongoDB to backend
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      writeConcern: { w: 1 },
    });
  } catch (error) {
    console.error(" MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
//Listens event from mongoose and trigger the function accordingly
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connection Successful");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected");
});
//Calling the function to connect to the database
connectDB();

app.use("/api/test", testRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/gig", gigRoutes);

app.use("/api/review", reviewRoutes);

app.use("/api/order", orderRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/message", messageRoutes);

app.use("/api/escrow", escrowRoutes);

app.use("/api/project", projectRoutes);

app.use("/api/bid", bidRoutes);

// app.get("/api/chat", (req, res) => {
//   res.send(chats);
// });

// app.get("/api/chat/:id", (req, res) => {
//   const singleChat = chats.find((c) => c._id === req.params.id);

//   res.send(singleChat);
// });

app.use("/", (req, res) => {
  res.send("Nepwork API Is running");
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).send(errorMessage);
});

const port = process.env.PORT || 7700;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢Connected To Socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("User data:", userData?._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.to(user._id).emit("message received", newMessageRecieved);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
