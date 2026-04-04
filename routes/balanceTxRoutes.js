import express from "express";
import BalanceTx from "../models/BalanceTx.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 ADD BALANCE TX
router.post("/", protect, async (req, res) => {
  const { type, amount } = req.body;

  const tx = await BalanceTx.create({
    type,
    amount,
  });

  res.json(tx);
});

// 🔥 GET
router.get("/", protect, async (req, res) => {
  const data = await BalanceTx.find();
  res.json(data);
});

export default router;