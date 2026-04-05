import express from "express";
import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";
import ExpenseTx from "../models/ExpenseTx.js";
import BalanceTx from "../models/BalanceTx.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // =====================================
  // 🔥 TODAY TRANSACTIONS
  // =====================================
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
  // 🔥 REPORT DATA (ALL HISTORY)
  // =====================================
  const reportRes = await fetch(
    `https://akshaya-backend.vercel.app/api/reports?from=2020-01-01&to=${todayStr}`
  );

  const reportData = await reportRes.json();

  // =====================================
  // 🔥 HANDLE EMPTY REPORT (IMPORTANT FIX)
  // =====================================
  let last;

  if (reportData.data && reportData.data.length > 0) {
    last = reportData.data[reportData.data.length - 1];
  } else {
    // 🔥 fallback to opening balance
    const balance = await Balance.findOne();

    last = {
      cashBalance: balance?.openingCash || 0,
      sbiCurrent: balance?.openingSbiCurrentBank || 0,
      sbiSavings: balance?.openingSbiSavingsBank || 0,
      edistrict: balance?.openingEdistrict || 0,
      psa: balance?.openingPSA || 0,
    };
  }

  // =====================================
  // 🔥 FINAL RESPONSE
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