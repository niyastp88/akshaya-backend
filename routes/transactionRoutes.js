import express from "express";
import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js"; // 🔥 IMPORTANT

const router = express.Router();

router.post("/", async (req, res) => {
  const { serviceId, cashAmount, bankAmount } = req.body;

  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  let edistrictAmount = 0;
  let psaAmount = 0;

  // 🔥 Auto deduction
  if (service.hasEdistrict) {
    edistrictAmount = service.edistrictCharge || 0;
  }

  if (service.hasPsa) {
    psaAmount = service.psaCharge || 0;
  }

  const transaction = await Transaction.create({
    serviceName: service.name,
    cashAmount: Number(cashAmount) || 0,
    bankAmount: Number(bankAmount) || 0,
    edistrictAmount,
    psaAmount,
  });

  res.json(transaction);
});

export default router;