import mongoose from "mongoose";

const examConfigSchema = new mongoose.Schema(
  {
    cutoff: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ExamConfig", examConfigSchema);
