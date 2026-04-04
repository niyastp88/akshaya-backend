import express from "express";
import AddBalance from "../models/AddBalance.js";
import BalanceTx from "../models/BalanceTx.js";

const router = express.Router();

// admin create names
router.post("/", async (req, res) => {
  const data = await AddBalance.create(req.body);
  res.json(data);
});

// get names
router.get("/", async (req, res) => {
  const data = await AddBalance.find();
  res.json(data);
});

// add balance
router.post("/add", async (req, res) => {
  const tx = await BalanceTx.create(req.body);
  res.json(tx);
});

export default router;