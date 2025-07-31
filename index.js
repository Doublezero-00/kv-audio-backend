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

mongoose.connect(mongoUrl);

let connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
//app.use("/api/reviews", reviewRouter);
//app.use("/api/inquiries", inquiryRouter);
//app.use("/api/orders", orderRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
