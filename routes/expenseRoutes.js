import express from "express";
import Expense from "../models/Expense.js";
import ExpenseTx from "../models/ExpenseTx.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// admin add expense type
router.post("/", async (req, res) => {
  const expense = await Expense.create(req.body);
  res.json(expense);
});

// get all expense types
router.get("/", async (req, res) => {
  const data = await Expense.find();
  res.json(data);
});

// staff add expense
router.post("/add", protect, async (req, res) => {
  const { expenseName, amount } = req.body;

  const tx = await ExpenseTx.create({
    expenseName,
    amount,
    staffId: req.user.id,
    staffName: req.user.name,
  });

  res.json(tx);
});

export default router;