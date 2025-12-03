import mongoose from "mongoose";

const examConfigSchema = new mongoose.Schema(
  {
    cutoff: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export default mongoose.model("ExamConfig", examConfigSchema);
