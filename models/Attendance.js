import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffName: String,

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    checkIn: Date,
    checkOut: Date,

    totalHours: Number, // in hours
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);