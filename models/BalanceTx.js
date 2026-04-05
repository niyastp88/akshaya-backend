import mongoose from "mongoose";

const balanceTxSchema = new mongoose.Schema({
  type: String,
  amount: Number,

  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  staffName: String,

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BalanceTx", balanceTxSchema);