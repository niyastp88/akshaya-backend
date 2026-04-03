import express from "express";
import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setDate(end.getDate() + 1);

  const transactions = await Transaction.find({
    date: { $gte: start, $lt: end },
  });

  const balance = await Balance.findOne();

  let cash = balance?.openingCash || 0;
  let sbiCurrent = balance?.openingSbiCurrentBank || 0;
  let sbiSavings = balance?.openingSbiSavingsBank || 0;
  let edistrict = balance?.openingEdistrict || 0;
  let psa = balance?.openingPSA || 0;

  const result = [];

  transactions.forEach((t) => {
    const date = t.date.toISOString().split("T")[0];

    // ✅ IN & OUT
    const inAmount = t.cashAmount+t.bankAmount;
    const outAmount = 0;

    // ✅ balances
    cash += t.cashAmount+t.bankAmount;
    sbiCurrent -= t.bankAmount;

    edistrict -= t.edistrictAmount;
    psa -= t.psaAmount;

    result.push({
      date,
      serviceName: t.serviceName,

      in: inAmount,
      out: outAmount,

      cashBalance: cash,
      sbiCurrent,
      sbiSavings,
      edistrict,
      psa,
    });
  });

  res.json({ data: result });
});

export default router;