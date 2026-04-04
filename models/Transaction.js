import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  serviceName: String,

  cashAmount: Number,
  bankAmount: Number,

  // 🔥 ADD THESE
  paymentType: {
    type: String,
    enum: ["cash", "gpay", "both"],
  },

  splitCash: {
    type: Number,
    default: 0,
  },

  gpayAmount: {
    type: Number,
    default: 0,
  },

  edistrictAmount: {
    type: Number,
    default: 0,
  },

  psaAmount: {
    type: Number,
    default: 0,
  },

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

export default mongoose.model("Transaction", transactionSchema);