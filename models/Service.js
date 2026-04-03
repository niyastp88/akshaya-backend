import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: String,

  hasCash: Boolean,
  hasBank: Boolean,

  hasEdistrict: Boolean,
  hasPsa: Boolean,
  hasBill:Boolean,

  edistrictCharge: {
    type: Number,
    default: 0,
  },

  psaCharge: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Service", serviceSchema);