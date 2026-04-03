import express from "express";
import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { serviceId, cashAmount, bankAmount } = req.body;

  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  let edistrictAmount = 0;
  let psaAmount = 0;

  const cash = Number(cashAmount) || 0;

  // 🔥 EDISTRICT BILL LOGIC
  if (service.hasEdistrict && service.hasBill) {

    let profit = 0;

    if (cash <= 1000) {
      profit = 15;
    } else if (cash <= 2000) {
      profit = 25;
    } else {
      profit = 35;
    }

    edistrictAmount = cash - profit; // 🔥 main logic
  }

  // 🔥 NORMAL EDISTRICT
  else if (service.hasEdistrict) {
    edistrictAmount = service.edistrictCharge || 0;
  }

  // 🔥 PSA
  if (service.hasPsa) {
    psaAmount = service.psaCharge || 0;
  }

  const transaction = await Transaction.create({
    serviceName: service.name,
    cashAmount: cash,
    bankAmount: Number(bankAmount) || 0,
    edistrictAmount,
    psaAmount,
  });

  res.json(transaction);
});

export default router;