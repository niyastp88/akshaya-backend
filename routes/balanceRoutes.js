import express from "express";
import Balance from "../models/Balance.js";

const router = express.Router();

// Set opening balance
router.post("/", async (req, res) => {
  const { openingCash, openingBank } = req.body;

  let balance = await Balance.findOne();

  if (balance) {
    balance.openingCash = openingCash;
    balance.openingBank = openingBank;
    await balance.save();
  } else {
    balance = await Balance.create({ openingCash, openingBank });
  }

  res.json(balance);
});

// Get balance
router.get("/", async (req, res) => {
  const balance = await Balance.findOne();
  res.json(balance);
});

export default router;