import express from "express";
import Transaction from "../models/Transaction.js";


const router = express.Router();

router.get("/", async (req, res) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // 🔥 TODAY DATA
  const tx = await Transaction.find({
    date: {
      $gte: new Date(todayStr),
      $lt: new Date(new Date(todayStr).setDate(today.getDate() + 1)),
    },
  });

  let totalCash = 0;
  let totalGpay = 0;
  let totalProfit = 0;

  tx.forEach((t) => {
    totalCash += t.splitCash || 0;
    totalGpay += t.gpayAmount || 0;
    totalProfit += t.profit || 0;
  });

  // =====================================
  // 🔥 CALL REPORT API
  // =====================================

  const reportRes = await fetch(
    `http://localhost:5000/api/reports?from=2020-01-01&to=${todayStr}`
  );

  const reportData = await reportRes.json();

  const last =
    reportData.data[reportData.data.length - 1] || {};

  // =====================================

  res.json({
    today: {
      cash: totalCash,
      gpay: totalGpay,
      profit: totalProfit,
    },
    balances: {
      cash: last.cashBalance || 0,
      sbiCurrent: last.sbiCurrent || 0,
      sbiSavings: last.sbiSavings || 0,
      edistrict: last.edistrict || 0,
      psa: last.psa || 0,
    },
  });
});

export default router;