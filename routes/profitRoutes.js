import express from "express";
import Transaction from "../models/Transaction.js";
import ExpenseTx from "../models/ExpenseTx.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to, type } = req.query;

  let start, end;

  const today = new Date();

  // 🔥 TODAY
  if (type === "today") {
    const todayStr = today.toISOString().split("T")[0];
    start = new Date(todayStr);
    end = new Date(todayStr);
    end.setDate(end.getDate() + 1);
  }

  // 🔥 MONTH
  else if (type === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date();
    end.setDate(end.getDate() + 1);
  }

  // 🔥 CUSTOM
  else {
    start = new Date(from);
    end = new Date(to);
    end.setDate(end.getDate() + 1);
  }

  // 🔥 GET DATA
  const tx = await Transaction.find({
    date: { $gte: start, $lt: end },
  });

  const expenses = await ExpenseTx.find({
    date: { $gte: start, $lt: end },
  });

  let totalProfit = 0;
  let totalExpense = 0;

  tx.forEach((t) => {
    totalProfit += t.profit || 0;
  });

  expenses.forEach((e) => {
    totalExpense += e.amount || 0;
  });

  res.json({
    profit: totalProfit,
    expense: totalExpense,
    net: totalProfit - totalExpense,
  });
});

export default router;