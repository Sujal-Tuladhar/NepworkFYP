import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
//Conencting Frontend to backend #credinatial true allows to send the cookies,tokens
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
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

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).send(errorMessage);
});

app.listen(7700, () => {
  console.log("🚀 Server started at http://localhost:7700");
});
