import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: [{ type: String, required: true }], // e.g. ["A", "B", "C", "D"]
    correctAnswerIndex: { type: Number, required: true } // 0-3
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
