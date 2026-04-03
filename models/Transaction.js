import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  serviceName: String,

  cashAmount: Number,
  bankAmount: Number,

  edistrictAmount: {
    type: Number,
    default: 0,
  },

  psaAmount: {
    type: Number,
    default: 0,
  },

  // 🔥 ADD THIS
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