import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Add transaction
router.post("/", async (req, res) => {
  const { serviceName, bankAmount, cashAmount } = req.body;

  const transaction = await Transaction.create({
    serviceName,
    bankAmount,
    cashAmount,
  });

  res.json(transaction);
});

// Get transactions (date filter)
router.get("/", async (req, res) => {
  const { date } = req.query;

  let filter = {};

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    filter.date = {
      $gte: start,
      $lt: end,
    };
  }

  const transactions = await Transaction.find(filter);
  res.json(transactions);
});

export default router;