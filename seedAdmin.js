import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ username: "akshayavml" });

if (!existing) {
  const hashed = await bcrypt.hash("Nisam@123", 10);

  await User.create({
    username: "akshayavml",
    name: "Admin",
    password: hashed,
    role: "admin",
  });

  console.log("Admin created");
} else {
  console.log("Admin already exists");
}

process.exit();