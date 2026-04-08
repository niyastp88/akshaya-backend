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

  // ================= OPENING =================
  const balance = await Balance.findOne();

  let cash = balance?.openingCash || 0;
  let sbiCurrent = balance?.openingSbiCurrentBank || 0;
  let sbiSavings = balance?.openingSbiSavingsBank || 0;
  let edistrict = balance?.openingEdistrict || 0;
  let psa = balance?.openingPSA || 0;

  // ================= PREVIOUS =================
  const prevTransactions = await Transaction.find({ date: { $lt: start } });
  const prevExpenses = await ExpenseTx.find({ date: { $lt: start } });
  const prevBalances = await BalanceTx.find({ date: { $lt: start } });

  const prevAll = [
    ...prevTransactions.map((t) => ({ ...t.toObject(), category: "tx" })),
    ...prevExpenses.map((e) => ({ ...e.toObject(), category: "expense" })),
    ...prevBalances.map((b) => ({ ...b.toObject(), category: "balance" })),
  ];

  prevAll.sort((a, b) => new Date(a.date) - new Date(b.date));

  prevAll.forEach((item) => {
    if (item.category === "tx") {
      cash += (item.cashAmount || 0) + (item.bankAmount || 0);
      sbiCurrent -= item.bankAmount || 0;

      edistrict -= item.edistrictAmount || 0;
      psa -= item.psaAmount || 0; // ✅ deduct PSA cost
    }

    else if (item.category === "expense") {
      cash -= item.amount;
    }

    else if (item.category === "balance") {
      if (item.type === "SBI Current Account") {
        cash -= item.amount;
        sbiCurrent += item.amount;
      }

      else if (item.type === "SBI Savings Account") {
        cash -= item.amount;
        sbiSavings += item.amount;
      }

      else if (item.type === "Edistrict") {
        sbiCurrent -= item.amount;
        edistrict += item.amount;
      }

      else if (item.type === "PSA") {
        psa += item.amount; // ✅ wallet add
      }
    }
  });

  // ================= CURRENT =================
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

  // ================= GROUP =================
  const grouped = {};

  all.forEach((item) => {
    const date = item.date.toISOString().split("T")[0];

    let name = "";
    let cashIn = 0;
    let bankIn = 0;
    let out = 0;
    let ed = 0;
    let psaAdd = 0;
    let psaDeduct = 0;

    if (item.category === "tx") {
      name = item.serviceName;

      cashIn = item.cashAmount || 0;
      bankIn = item.bankAmount || 0;

      ed = item.edistrictAmount || 0;
      psaDeduct = item.psaAmount || 0; // ✅ deduct

      totalCash += item.splitCash || 0;
      totalGpay += item.gpayAmount || 0;
      totalProfit += item.profit || 0;
    }

    else if (item.category === "expense") {
      name = item.expenseName;
      out = item.amount;
    }

    else if (item.category === "balance") {
      name = item.type;

      if (
        item.type === "SBI Current Account" ||
        item.type === "SBI Savings Account"
      ) {
        out = item.amount;
      }

      else if (item.type === "Edistrict") {
        ed += item.amount;
      }

      else if (item.type === "PSA") {
        psaAdd = item.amount; // ✅ add
      }
    }

    const key = `${date}_${name}`;

    if (!grouped[key]) {
      grouped[key] = {
        date,
        serviceName: name,
        cashIn: 0,
        bankIn: 0,
        out: 0,
        ed: 0,
        psaAdd: 0,
        psaDeduct: 0,
      };
    }

    grouped[key].cashIn += cashIn;
    grouped[key].bankIn += bankIn;
    grouped[key].out += out;
    grouped[key].ed += ed;
    grouped[key].psaAdd += psaAdd;
    grouped[key].psaDeduct += psaDeduct;
  });

  let result = Object.values(grouped);

  result.sort((a, b) => new Date(a.date) - new Date(b.date));

  // ================= FINAL FLOW =================
  result = result.map((row) => {
    cash += row.cashIn + row.bankIn;
    cash -= row.out;

    sbiCurrent -= row.bankIn;
    edistrict -= row.ed;

    // 🔥 FINAL PSA LOGIC
    psa += row.psaAdd;
    psa -= row.psaDeduct;

    return {
      date: row.date,
      serviceName: row.serviceName,
      in: row.cashIn + row.bankIn,
      out: row.out,
      cashBalance: cash,
      sbiCurrent,
      sbiSavings,
      edistrict,
      psa,
    };
  });

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