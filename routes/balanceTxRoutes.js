import express from "express";
import BalanceTx from "../models/BalanceTx.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 ADD BALANCE TX
router.post("/", protect, async (req, res) => {
  const { type, amount } = req.body;

  const data = await BalanceTx.create({
    type,
    amount,
    staffId: req.user.id,
    staffName: req.user.name,
  });

  res.json(data);
});

// 🔥 GET
router.get("/", protect, async (req, res) => {
  const data = await BalanceTx.find();
  res.json(data);
});

router.get("/all", protect, async (req, res) => {
  const data = await BalanceTx.find().sort({ date: -1 });
  res.json(data);
});


export default router;