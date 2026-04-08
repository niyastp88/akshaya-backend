import express from "express";
import Attendance from "../models/Attendance.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"];

  return {
    ip: req.ip,
    userAgent: ua,
    browser: ua.includes("Chrome") ? "Chrome" : "Other",
    os: ua.includes("Windows")
      ? "Windows"
      : ua.includes("Android")
      ? "Android"
      : ua.includes("iPhone")
      ? "iOS"
      : "Other",
    device: ua.includes("Mobile") ? "Mobile" : "Desktop",
  };
};

// ================= CHECK IN =================
router.post("/check-in", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const existing = await Attendance.findOne({
    staffId: req.user.id,
    date: today,
  });

  if (existing) {
    return res.status(400).json({
      message: "Already checked in today",
    });
  }

  const deviceInfo = getDeviceInfo(req);

  const data = await Attendance.create({
    staffId: req.user.id,
    staffName: req.user.name,
    date: today,
    checkIn: new Date(),
    deviceInfo, // 🔥 SAVE HERE
  });

  res.json(data);
});

// ================= CHECK OUT =================
router.post("/check-out", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const attendance = await Attendance.findOne({
    staffId: req.user.id,
    date: today,
  });

  if (!attendance) {
    return res.status(400).json({
      message: "Check-in first",
    });
  }

  if (attendance.checkOut) {
    return res.status(400).json({
      message: "Already checked out",
    });
  }

  const checkOutTime = new Date();

  const diffMs = checkOutTime - attendance.checkIn;
  const hours = diffMs / (1000 * 60 * 60);

  attendance.checkOut = checkOutTime;
  attendance.totalHours = Number(hours.toFixed(2));

  await attendance.save();

  res.json(attendance);
});

// ================= MY ATTENDANCE =================
router.get("/my", protect, async (req, res) => {
  const data = await Attendance.find({
    staffId: req.user.id,
  }).sort({ date: -1 });

  res.json(data);
});

// ================= ADMIN VIEW =================
router.get("/all", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const { from, to, staffId } = req.query;

  let filter = {};

  if (staffId) filter.staffId = staffId;

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    filter.createdAt = { $gte: start, $lt: end };
  }

  const data = await Attendance.find(filter).sort({ date: -1 });

  res.json(data);
});

export default router;