import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import serviceRoutes from "./routes/serviceRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import addBalanceRoutes from "./routes/addBalanceRoutes.js";
import balanceTxRoutes from "./routes/balanceTxRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/services", serviceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/add-balance", addBalanceRoutes);
app.use("/api/balance-tx", balanceTxRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});