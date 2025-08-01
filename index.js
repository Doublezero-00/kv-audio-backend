import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
//import reviewRouter from "../../../kv-audio-original/kv-audio-backend/routes/reviewRouter.js";
//import inquiryRouter from "../../../kv-audio-original/kv-audio-backend/routes/inquiryRouter.js";
//import orderRouter from "../../../kv-audio-original/kv-audio-backend/routes/orderRouter.js";

dotenv.config();

console.log("🚀 Server is starting...");
console.log("🔐 Mongo URL:", process.env.MONGO_URL ? "Loaded" : "Missing!");

let app = express();
app.use(cors()); //middleware to allow cross-origin requests
app.use(bodyParser.json()); //middleware

app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token != null) {
    token = token.replace("Bearer ", "");
    console.log(token);

    jwt.verify(token, "kv-secret-25!", (err, decoded) => {
      console.log(err);

      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
});

let mongoUrl = process.env.MONGO_URL;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("✅ MongoDB database connection established successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
//app.use("/api/reviews", reviewRouter);
//app.use("/api/inquiries", inquiryRouter);
//app.use("/api/orders", orderRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
