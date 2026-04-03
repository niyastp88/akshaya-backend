import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema({
  openingCash: Number,
  openingSbiCurrentBank: Number,
  openingSbiSavingsBank:Number,
  openingEdistrict:Number,
  openingPSA:Number
});

export default mongoose.model("Balance", balanceSchema);