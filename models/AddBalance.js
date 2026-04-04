import mongoose from "mongoose";

const addBalanceSchema = new mongoose.Schema({
  name: String, // SBI Current Deposit etc
});

export default mongoose.model("AddBalance", addBalanceSchema);