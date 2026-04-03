import express from "express";
import Balance from "../models/Balance.js";

const router = express.Router();

// ✅ Set opening balance (all fields)
router.post("/", async (req, res) => {
  const {
    openingCash,
    openingSbiCurrentBank,
    openingSbiSavingsBank,
    openingEdistrict,
    openingPSA,
  } = req.body;

  let balance = await Balance.findOne();

  if (balance) {
    balance.openingCash = openingCash;
    balance.openingSbiCurrentBank = openingSbiCurrentBank;
    balance.openingSbiSavingsBank = openingSbiSavingsBank;
    balance.openingEdistrict = openingEdistrict;
    balance.openingPSA = openingPSA;

    await balance.save();
  } else {
    balance = await Balance.create({
      openingCash,
      openingSbiCurrentBank,
      openingSbiSavingsBank,
      openingEdistrict,
      openingPSA,
    });
  }

  res.json(balance);
});

// ✅ Get balance
router.get("/", async (req, res) => {
  const balance = await Balance.findOne();
  res.json(balance);
});

export default router;