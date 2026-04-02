import express from "express";
import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";

const router = express.Router();

// GET REPORT
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

  const balanceData = await Balance.findOne();

  let openingCash = balanceData?.openingCash || 0;
  let openingBank = balanceData?.openingBank || 0;

  // 🔥 Grouping
  const grouped = {};

  transactions.forEach((t) => {
    if (!grouped[t.serviceName]) {
      grouped[t.serviceName] = {
        cash: 0,
        bank: 0,
      };
    }

    grouped[t.serviceName].cash += t.cashAmount;
    grouped[t.serviceName].bank += t.bankAmount;
  });

  // 🔥 Running balance
  let cashBalance = openingCash;
  let bankBalance = openingBank;

  const result = Object.entries(grouped).map(([service, data]) => {
    cashBalance += data.cash;
    bankBalance -= data.bank;

    return {
      serviceName: service,
      cashIn: data.cash,
      bankDebit: data.bank,
      cashBalance,
      bankBalance,
    };
  });

  res.json({
    openingCash,
    openingBank,
    data: result,
  });
});

export default router;