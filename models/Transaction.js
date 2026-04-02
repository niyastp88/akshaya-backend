import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    serviceName: String,
    bankAmount: Number,
    cashAmount: Number,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);