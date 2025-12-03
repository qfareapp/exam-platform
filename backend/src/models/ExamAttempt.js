import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedIndex: { type: Number } // 0-3, or null if unanswered
      }
    ],
    score: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("ExamAttempt", examAttemptSchema);
