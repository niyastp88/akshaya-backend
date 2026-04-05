import express from "express";
import Expense from "../models/Expense.js";
import ExpenseTx from "../models/ExpenseTx.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// admin add expense type
// 🔥 CREATE EXPENSE TYPE (ADMIN)
router.post("/", protect, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name required" });
  }

  const data = await Expense.create({ name });

  res.json(data);
});


router.get("/my", protect, async (req, res) => {
  const { from, to } = req.query;

  let filter = { staffId: req.user.id };

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    filter.date = { $gte: start, $lt: end };
  }

  const data = await ExpenseTx.find(filter).sort({ date: -1 });

  res.json(data);
});


// get all expense types
router.get("/", async (req, res) => {
  const data = await Expense.find();
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

  const data = await ExpenseTx.find(filter).sort({ date: -1 });

  res.json(data);
});

// staff add expense
router.post("/add",protect, async (req, res) => {
  const { expenseName, amount } = req.body;

  const tx = await ExpenseTx.create({
    expenseName,
    amount,
    staffId: req.user.id,
    staffName: req.user.name,
  });

  res.json(tx);
});

router.delete("/:id", protect, async (req, res) => {
  const item = await ExpenseTx.findById(req.params.id);

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

router.put("/:id", protect, async (req, res) => {
  const item = await ExpenseTx.findById(req.params.id);

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


export default router;