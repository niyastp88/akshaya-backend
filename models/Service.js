import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: String,
  hasBank: Boolean,
  hasCash: Boolean,
});

export default mongoose.model("Service", serviceSchema);