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

  // 🔥 GROUPING OBJECT
  const grouped = {};

  transactions.forEach((t) => {
    const date = t.date.toISOString().split("T")[0];
    const key = `${date}-${t.serviceName}`;

    if (!grouped[key]) {
      grouped[key] = {
        date,
        serviceName: t.serviceName,
        cashAmount: 0,
        bankAmount: 0,
        edistrictAmount: 0,
        psaAmount: 0,
      };
    }

    grouped[key].cashAmount += t.cashAmount || 0;
    grouped[key].bankAmount += t.bankAmount || 0;
    grouped[key].edistrictAmount += t.edistrictAmount || 0;
    grouped[key].psaAmount += t.psaAmount || 0;
  });

  const result = [];

  Object.values(grouped).forEach((g) => {
    const inAmount = g.cashAmount + g.bankAmount;

    // balances update
    cash += inAmount;
    sbiCurrent -= g.bankAmount;
    edistrict -= g.edistrictAmount;
    psa -= g.psaAmount;

    result.push({
      date: g.date,
      serviceName: g.serviceName,
      in: inAmount,
      out: 0,
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