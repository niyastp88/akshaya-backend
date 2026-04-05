import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  expenseName: String,
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

export default mongoose.model("ExpenseTx", expenseSchema);