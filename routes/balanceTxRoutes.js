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
router.get("/my", protect, async (req, res) => {
  const { from, to } = req.query;

  let filter = { staffId: req.user.id };

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    filter.date = { $gte: start, $lt: end };
  }

  const data = await BalanceTx.find(filter).sort({ date: -1 });

  res.json(data);
});

router.get("/all", protect, async (req, res) => {
  const { from, to, staffId } = req.query;

  let filter = {};

  if (staffId) {
    filter.staffId = staffId;
  }

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    filter.date = { $gte: start, $lt: end };
  }

  const data = await BalanceTx.find(filter).sort({ date: -1 });

  res.json(data);
});

router.put("/:id", protect, async (req, res) => {
  const item = await BalanceTx.findById(req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });

  const isAdmin = req.user.role === "admin";

  const today = new Date().toISOString().split("T")[0];
  const itemDate = item.date.toISOString().split("T")[0];

  if (!isAdmin && today !== itemDate) {
    return res.status(403).json({ message: "Not allowed" });
  }

  Object.assign(item, req.body);
  await item.save();

  res.json(item);
});

router.delete("/:id", protect, async (req, res) => {
  const item = await BalanceTx.findById(req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });

  const isAdmin = req.user.role === "admin";

  const today = new Date().toISOString().split("T")[0];
  const itemDate = item.date.toISOString().split("T")[0];

  if (!isAdmin && today !== itemDate) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await item.deleteOne();

  res.json({ message: "Deleted" });
});

export default router;