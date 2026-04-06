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

  // =====================================
  // 🔥 OPENING BALANCE
  // =====================================
  const balance = await Balance.findOne();

  let cash = balance?.openingCash || 0;
  let sbiCurrent = balance?.openingSbiCurrentBank || 0;
  let sbiSavings = balance?.openingSbiSavingsBank || 0;
  let edistrict = balance?.openingEdistrict || 0;
  let psa = balance?.openingPSA || 0;

  // =====================================
  // 🔥 APPLY PREVIOUS DATA
  // =====================================
  const prevTransactions = await Transaction.find({
    date: { $lt: start },
  });

  const prevExpenses = await ExpenseTx.find({
    date: { $lt: start },
  });

  const prevBalances = await BalanceTx.find({
    date: { $lt: start },
  });

  const prevAll = [
    ...prevTransactions.map((t) => ({ ...t.toObject(), category: "tx" })),
    ...prevExpenses.map((e) => ({ ...e.toObject(), category: "expense" })),
    ...prevBalances.map((b) => ({ ...b.toObject(), category: "balance" })),
  ];

  prevAll.sort((a, b) => new Date(a.date) - new Date(b.date));

  prevAll.forEach((item) => {
    if (item.category === "tx") {
      const cashIn = item.cashAmount || 0;
      const bankIn = item.bankAmount || 0;

      cash += cashIn + bankIn;
      sbiCurrent -= bankIn;
      edistrict -= item.edistrictAmount || 0;
      psa -= item.psaAmount || 0;
    } else if (item.category === "expense") {
      cash -= item.amount;
    } else if (item.category === "balance") {
      if (item.type === "SBI Current Account") {
        cash -= item.amount;
        sbiCurrent += item.amount;
      } else if (item.type === "SBI Savings Account") {
        cash -= item.amount;
        sbiSavings += item.amount;
      } else if (item.type === "Edistrict") {
        sbiCurrent -= item.amount;
        edistrict += item.amount;
      } else if (item.type === "PSA") {
        sbiCurrent -= item.amount;
        psa += item.amount;
      }
    }
  });

  // =====================================
  // 🔥 CURRENT RANGE DATA
  // =====================================
  const transactions = await Transaction.find({
    date: { $gte: start, $lt: end },
  });

  const expenses = await ExpenseTx.find({
    date: { $gte: start, $lt: end },
  });

  const balances = await BalanceTx.find({
    date: { $gte: start, $lt: end },
  });

  let totalCash = 0;
  let totalGpay = 0;
  let totalProfit = 0;

  const all = [
    ...transactions.map((t) => ({ ...t.toObject(), category: "tx" })),
    ...expenses.map((e) => ({ ...e.toObject(), category: "expense" })),
    ...balances.map((b) => ({ ...b.toObject(), category: "balance" })),
  ];

  all.sort((a, b) => new Date(a.date) - new Date(b.date));

  // =====================================
  // 🔥 STEP 1: RUNNING FLOW
  // =====================================
  const temp = [];

  all.forEach((item) => {
    const date = item.date.toISOString().split("T")[0];

    let serviceName = "";
    let inAmount = 0;
    let outAmount = 0;

    // ===== TX =====
    if (item.category === "tx") {
      serviceName = item.serviceName;

      const cashIn = item.cashAmount || 0;
      const bankIn = item.bankAmount || 0;

      inAmount = cashIn + bankIn;

      cash += inAmount;
      sbiCurrent -= bankIn;
      edistrict -= item.edistrictAmount || 0;
      psa -= item.psaAmount || 0;

      totalCash += item.splitCash || 0;
      totalGpay += item.gpayAmount || 0;
      totalProfit += item.profit || 0;
    }

    // ===== EXPENSE =====
    else if (item.category === "expense") {
      serviceName = item.expenseName;
      outAmount = item.amount;

      cash -= item.amount;
    }

    // ===== BALANCE =====
    else if (item.category === "balance") {
      serviceName = item.type;

      if (item.type === "SBI Current Account") {
        cash -= item.amount;
        sbiCurrent += item.amount;
        outAmount = item.amount;
      } else if (item.type === "SBI Savings Account") {
        cash -= item.amount;
        sbiSavings += item.amount;
        outAmount = item.amount;
      } else if (item.type === "Edistrict") {
        sbiCurrent -= item.amount;
        edistrict += item.amount;
      } else if (item.type === "PSA") {
        sbiCurrent -= item.amount;
        psa += item.amount;
      }
    }

    temp.push({
      date,
      serviceName,
      in: inAmount,
      out: outAmount,
      cashBalance: cash,
      sbiCurrent,
      sbiSavings,
      edistrict,
      psa,
    });
  });

  // =====================================
  // 🔥 STEP 2: GROUP FOR UI
  // =====================================
  const grouped = {};

  temp.forEach((row) => {
    const key = `${row.date}_${row.serviceName}`;

    if (!grouped[key]) {
      grouped[key] = {
        ...row,
        in: 0,
        out: 0,
      };
    }

    grouped[key].in += row.in;
    grouped[key].out += row.out;

    // 🔥 last balance overwrite
    grouped[key].cashBalance = row.cashBalance;
    grouped[key].sbiCurrent = row.sbiCurrent;
    grouped[key].sbiSavings = row.sbiSavings;
    grouped[key].edistrict = row.edistrict;
    grouped[key].psa = row.psa;
  });

  const result = Object.values(grouped);

  // =====================================
  // 🔥 RESPONSE
  // =====================================
  res.json({
    data: result,
    totals: {
      cash: totalCash,
      gpay: totalGpay,
      profit: totalProfit,
    },
  });
});

export default router;