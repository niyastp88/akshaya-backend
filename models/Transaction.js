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

  staffName: String,

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", transactionSchema);