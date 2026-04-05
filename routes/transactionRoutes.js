import express from "express";
import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// 🔥 CREATE TRANSACTION
// =========================
router.post("/", protect, async (req, res) => {
  const {
    serviceId,
    cashAmount,
    bankAmount,
    splitCash,
    gpayAmount,
    paymentType,
  } = req.body;

  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const cash = Number(cashAmount) || 0;
  const bank = Number(bankAmount) || 0;

  let edistrictAmount = 0;
  let psaAmount = 0;
  let profit = 0;

  // 🔥 EDISTRICT BILL
  if (service.hasEdistrict && service.hasBill) {
    if (cash <= 1000) profit = 15;
    else if (cash <= 2000) profit = 25;
    else profit = 35;

    edistrictAmount = cash - profit;
  }

  // 🔥 NORMAL EDISTRICT
  else if (service.hasEdistrict) {
    edistrictAmount = service.edistrictCharge || 0;
    profit = cash - 7;
  }

  // 🔥 PSA
  else if (service.hasPsa) {
    psaAmount = service.psaCharge || 0;
    profit = cash - 109;
  }

  // 🔥 CASH + BANK
  else if (service.hasCash && service.hasBank) {
    profit = cash;
  }

  // 🔥 CASH ONLY
  else if (service.hasCash) {
    profit = cash;
  }

  const transaction = await Transaction.create({
    serviceName: service.name,
    cashAmount: cash,
    bankAmount: bank,

    splitCash: splitCash || 0,
    gpayAmount: gpayAmount || 0,
    paymentType,

    edistrictAmount,
    psaAmount,
    profit,

    staffId: req.user.id,
    staffName: req.user.name,
  });

  res.json(transaction);
});

// =========================
// 🔥 MY TRANSACTIONS (STAFF)
// =========================
router.get("/my", protect, async (req, res) => {
  const { from, to } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setDate(end.getDate() + 1);

  const data = await Transaction.find({
    staffId: req.user.id,
    date: { $gte: start, $lt: end },
  }).sort({ date: -1 });

  res.json(data);
});

// =========================
// 🔥 STAFF REPORT (ADMIN)
// =========================
router.get("/staff-report", protect, async (req, res) => {
  const { staffId, from, to } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setDate(end.getDate() + 1);

  const data = await Transaction.find({
    staffId,
    date: { $gte: start, $lt: end },
  }).sort({ date: -1 });

  res.json(data);
});

// =========================
// 🔥 UPDATE
// =========================
router.put("/:id", protect, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({ message: "Not found" });
  }

  const isAdmin = req.user.role === "admin";

  const today = new Date().toISOString().split("T")[0];
  const txDate = transaction.date.toISOString().split("T")[0];

  // 🔒 STAFF restriction
  if (!isAdmin && today !== txDate) {
    return res.status(403).json({ message: "Cannot edit old data" });
  }

  // 🔥 NEW VALUES
  const cash = Number(req.body.cashAmount) || 0;
  const bank = Number(req.body.bankAmount) || 0;

  // 🔥 GET SERVICE AGAIN
  const service = await Service.findOne({
    name: transaction.serviceName,
  });

  let edistrictAmount = 0;
  let psaAmount = 0;
  let profit = 0;

  if (service) {
    // 🔥 EDISTRICT BILL
    if (service.hasEdistrict && service.hasBill) {
      if (cash <= 1000) profit = 15;
      else if (cash <= 2000) profit = 25;
      else profit = 35;

      edistrictAmount = cash - profit;
    }

    // 🔥 NORMAL EDISTRICT
    else if (service.hasEdistrict) {
      edistrictAmount = service.edistrictCharge || 0;
      profit = cash - 7;
    }

    // 🔥 PSA
    else if (service.hasPsa) {
      psaAmount = service.psaCharge || 0;
      profit = cash - 109;
    }

    // 🔥 CASH + BANK
    else if (service.hasCash && service.hasBank) {
      profit = cash;
    }

    // 🔥 CASH ONLY
    else if (service.hasCash) {
      profit = cash;
    }
  }

  // 🔥 UPDATE VALUES
  transaction.cashAmount = cash;
  transaction.bankAmount = bank;

  transaction.edistrictAmount = edistrictAmount;
  transaction.psaAmount = psaAmount;
  transaction.profit = profit;

  await transaction.save();

  res.json(transaction);
});

// =========================
// 🔥 DELETE
// =========================
router.delete("/:id", protect, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({ message: "Not found" });
  }

  const isAdmin = req.user.role === "admin";

  const today = new Date().toISOString().split("T")[0];
  const txDate = transaction.date.toISOString().split("T")[0];

  if (!isAdmin && today !== txDate) {
    return res.status(403).json({ message: "Cannot delete old data" });
  }

  await transaction.deleteOne();

  res.json({ message: "Deleted successfully" });
});

export default router;