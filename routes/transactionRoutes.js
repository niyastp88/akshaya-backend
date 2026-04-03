import express from "express";
import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { serviceId, cashAmount, bankAmount } = req.body;

  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  let edistrictAmount = 0;
  let psaAmount = 0;

  const cash = Number(cashAmount) || 0;

  // 🔥 EDISTRICT BILL
  if (service.hasEdistrict && service.hasBill) {
    let profit = 0;

    if (cash <= 1000) profit = 15;
    else if (cash <= 2000) profit = 25;
    else profit = 35;

    edistrictAmount = cash - profit;
  }

  else if (service.hasEdistrict) {
    edistrictAmount = service.edistrictCharge || 0;
  }

  if (service.hasPsa) {
    psaAmount = service.psaCharge || 0;
  }

  const transaction = await Transaction.create({
    serviceName: service.name,
    cashAmount: cash,
    bankAmount: Number(bankAmount) || 0,
    edistrictAmount,
    psaAmount,

    // 🔥 ADD THIS (IMPORTANT)
    staffId: req.user.id,
    staffName: req.user.name,
  });

  res.json(transaction);
});

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

// 🔥 STAFF WISE REPORT (ADMIN)
router.get("/staff-report", protect, adminOnly, async (req, res) => {
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

// 🔥 UPDATE
router.put("/:id", protect, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({ message: "Not found" });
  }

  const isAdmin = req.user.role === "admin";

  const today = new Date().toISOString().split("T")[0];
  const txDate = transaction.date.toISOString().split("T")[0];

  // 🔥 STAFF restriction
  if (!isAdmin && today !== txDate) {
    return res.status(403).json({ message: "Cannot edit old data" });
  }

  Object.assign(transaction, req.body);

  await transaction.save();

  res.json(transaction);
});

// 🔥 UPDATE
// 🔥 DELETE TRANSACTION
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    const isAdmin = req.user.role === "admin";

    const today = new Date().toISOString().split("T")[0];
    const txDate = transaction.date.toISOString().split("T")[0];

    // 🔒 STAFF restriction
    if (!isAdmin && today !== txDate) {
      return res.status(403).json({ message: "Cannot delete old data" });
    }

    await transaction.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;