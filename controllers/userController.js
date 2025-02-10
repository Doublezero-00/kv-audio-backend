import User from "../models/User.js";
import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";

export function registerUser(req, res) {
  let user_data = req.body;
  user_data.password = bcrypt.hashSync(user_data.password, 10);
  const newUser = new User(req.body);

  newUser
    .save()
    .then(() => {
      res.json({
        message: "User saved successfully",
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "User registration failed",
      });
    });
}

export function loginUser(req, res) {
  const data = req.body;

  User.findOne({
    email: data.email,
  }).then((user) => {
    if (user == null) {
      res.status(404).json({
        error: "User not found",
      });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(
        data.password,
        user.password
      );

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          "kv-secret-25!"
        );
        res.json({
          message: "Login successful",
          token: token,
        });
      } else {
        res.status(401).json({
          error: "Login failed",
        });
      }
    }
  });
}
