import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    allowed: { type: Boolean, default: true }, // Excel upload will create these
    hasAttempted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: null },
    startedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
