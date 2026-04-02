import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema({
  openingCash: Number,
  openingBank: Number,
});

export default mongoose.model("Balance", balanceSchema);