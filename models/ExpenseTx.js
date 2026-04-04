import mongoose from "mongoose";

const expenseTxSchema = new mongoose.Schema({
  expenseName: String,
  amount: Number,

  staffId: mongoose.Schema.Types.ObjectId,
  staffName: String,

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ExpenseTx", expenseTxSchema);