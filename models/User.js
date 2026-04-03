import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  name: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "staff"],
    default: "staff",
  },
});

export default mongoose.model("User", userSchema);