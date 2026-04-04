import express from "express";
import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";
import ExpenseTx from "../models/ExpenseTx.js";
import BalanceTx from "../models/BalanceTx.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setDate(end.getDate() + 1);

  const transactions = await Transaction.find({
    date: { $gte: start, $lt: end },
  });

  const expenses = await ExpenseTx.find({
    date: { $gte: start, $lt: end },
  });

  const balances = await BalanceTx.find({
    date: { $gte: start, $lt: end },
  });

  const balance = await Balance.findOne();

  let cash = balance?.openingCash || 0;
  let sbiCurrent = balance?.openingSbiCurrentBank || 0;
  let sbiSavings = balance?.openingSbiSavingsBank || 0;
  let edistrict = balance?.openingEdistrict || 0;
  let psa = balance?.openingPSA || 0;

  const result = [];

  // 🔥 TOTALS
  let totalCash = 0;
  let totalGpay = 0;
  let totalProfit = 0;

  const all = [
    ...transactions.map((t) => ({
      ...t.toObject(),
      category: "tx",
    })),
    ...expenses.map((e) => ({
      ...e.toObject(),
      category: "expense",
    })),
    ...balances.map((b) => ({
      ...b.toObject(),
      category: "balance",
    })),
  ];

  all.sort((a, b) => {
    const d1 = new Date(a.date);
    const d2 = new Date(b.date);

    if (d1.getTime() === d2.getTime()) {
      return a._id.toString().localeCompare(b._id.toString());
    }

    return d1 - d2;
  });

  all.forEach((item) => {
    const date = item.date.toISOString().split("T")[0];

    // =========================
    // 🔥 TRANSACTION
    // =========================
    if (item.category === "tx") {
      const inAmount =
        (item.cashAmount || 0) + (item.bankAmount || 0);

      cash += inAmount;
      sbiCurrent -= item.bankAmount || 0;
      edistrict -= item.edistrictAmount || 0;
      psa -= item.psaAmount || 0;

      // 🔥 TOTAL CASH / GPAY
      totalCash += item.splitCash || 0;
      totalGpay += item.gpayAmount || 0;

      // 🔥 PROFIT LOGIC
      let profit = 0;
      const c = item.cashAmount || 0;

      if (item.psaAmount > 0) {
        profit = c - 109;
      }

      else if (item.edistrictAmount > 0 && item.bankAmount === 0) {
        profit = c - 7;
      }

      else if (item.edistrictAmount > 0 && item.bankAmount > 0) {
        if (c <= 1000) profit = 15;
        else if (c <= 2000) profit = 25;
        else profit = 35;
      }

      else if (item.cashAmount > 0 && item.bankAmount > 0) {
        profit = c;
      }

      else if (item.cashAmount > 0) {
        profit = c;
      }

      totalProfit += profit;

      result.push({
        date,
        serviceName: item.serviceName,
        in: inAmount,
        out: 0,
        cashBalance: cash,
        sbiCurrent,
        sbiSavings,
        edistrict,
        psa,
      });
    }

    // =========================
    // 🔥 EXPENSE
    // =========================
    else if (item.category === "expense") {
      cash -= item.amount;

      result.push({
        date,
        serviceName: item.expenseName,
        in: 0,
        out: item.amount,
        cashBalance: cash,
        sbiCurrent,
        sbiSavings,
        edistrict,
        psa,
      });
    }

    // =========================
    // 🔥 BALANCE
    // =========================
    else if (item.category === "balance") {
      const type = item.type;

      if (type === "SBI Current Account") {
        cash -= item.amount;
        sbiCurrent += item.amount;

        result.push({
          date,
          serviceName: "Deposit to SBI Current",
          in: 0,
          out: item.amount,
          cashBalance: cash,
          sbiCurrent,
          sbiSavings,
          edistrict,
          psa,
        });
      }

      else if (type === "SBI Savings Account") {
        cash -= item.amount;
        sbiSavings += item.amount;

        result.push({
          date,
          serviceName: "Deposit to SBI Savings",
          in: 0,
          out: item.amount,
          cashBalance: cash,
          sbiCurrent,
          sbiSavings,
          edistrict,
          psa,
        });
      }

      else if (type === "Edistrict") {
        sbiCurrent -= item.amount;
        edistrict += item.amount;

        result.push({
          date,
          serviceName: "Edistrict Load",
          in: 0,
          out: 0,
          cashBalance: cash,
          sbiCurrent,
          sbiSavings,
          edistrict,
          psa,
        });
      }

      else if (type === "PSA") {
        sbiCurrent -= item.amount;
        psa += item.amount;

        result.push({
          date,
          serviceName: "PSA Load",
          in: 0,
          out: 0,
          cashBalance: cash,
          sbiCurrent,
          sbiSavings,
          edistrict,
          psa,
        });
      }
    }
  });

  res.json({
    data: result,
    totals: {
      cash: totalCash,
      gpay: totalGpay,
      profit:0
    },
  });
});

export default router;