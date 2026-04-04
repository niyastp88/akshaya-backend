import mongoose from "mongoose";

const balanceTxSchema = new mongoose.Schema({
  type: String, // SBI Current / Savings / Edistrict / PSA
  amount: Number,

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BalanceTx", balanceTxSchema);