import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create staff
router.post("/", protect, adminOnly, async (req, res) => {
  const { username, name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    name,
    password: hashedPassword,
    role: "staff",
  });

  res.json(user);
});

router.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find({ role: "staff" });
  res.json(users);
});

export default router;