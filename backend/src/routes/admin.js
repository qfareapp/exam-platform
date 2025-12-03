import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import User from "../models/User.js";
import Question from "../models/Question.js";
import ExamConfig from "../models/ExamConfig.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/admin/upload-users
// Excel format: columns [name, email, phone]
router.post(
  "/upload-users",
  adminMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet);

      let created = 0;
      for (const row of json) {
        const name = String(row.name || row.Name || "").trim();
        const email = String(row.email || row.Email || "").trim();
        const phone = String(row.phone || row.Phone || "").trim();
        if (!email || !phone) continue;

        const existing = await User.findOne({ email });
        if (existing) {
          existing.phone = phone;
          if (name) existing.name = name;
          existing.allowed = true;
          await existing.save();
        } else {
          await User.create({ name, email, phone, allowed: true });
        }
        created++;
      }

      res.json({ message: "Users uploaded/updated", count: created });
    } catch (err) {
      console.error("Upload users error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// POST /api/admin/questions
router.post("/questions", adminMiddleware, async (req, res) => {
  try {
    const { text, options, correctAnswerIndex } = req.body;
    if (!text || !options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Question text and options required" });
    }
    const question = await Question.create({
      text,
      options,
      correctAnswerIndex,
    });
    res.json(question);
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/questions
router.get("/questions", adminMiddleware, async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

// DELETE /api/admin/questions/:id
router.delete("/questions/:id", adminMiddleware, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// PATCH /api/admin/questions/:id
router.patch("/questions/:id", adminMiddleware, async (req, res) => {
  const { text, options, correctAnswerIndex } = req.body;
  const update = {};
  if (typeof text === "string" && text.trim()) update.text = text.trim();
  if (Array.isArray(options) && options.length >= 2) update.options = options;
  if (typeof correctAnswerIndex === "number") update.correctAnswerIndex = correctAnswerIndex;

  const question = await Question.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json(question);
});

// GET /api/admin/results
router.get("/results", adminMiddleware, async (req, res) => {
  const users = await User.find().select(
    "name email phone score submittedAt passed hasAttempted"
  );
  const appeared = users.filter((u) => u.hasAttempted).length;
  res.json({ users, appeared, total: users.length });
});

// GET /api/admin/config
router.get("/config", adminMiddleware, async (_req, res) => {
  const existing = await ExamConfig.findOne();
  if (existing) return res.json(existing);
  const created = await ExamConfig.create({ cutoff: 0 });
  res.json(created);
});

// POST /api/admin/config
router.post("/config", adminMiddleware, async (req, res) => {
  const { cutoff } = req.body;
  const value = typeof cutoff === "number" && cutoff >= 0 ? cutoff : 0;
  const existing = await ExamConfig.findOne();
  if (existing) {
    existing.cutoff = value;
    await existing.save();
    return res.json(existing);
  }
  const created = await ExamConfig.create({ cutoff: value });
  res.json(created);
});

export default router;
