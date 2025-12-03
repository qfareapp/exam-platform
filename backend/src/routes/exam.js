import express from "express";
import Question from "../models/Question.js";
import User from "../models/User.js";
import ExamAttempt from "../models/ExamAttempt.js";
import ExamConfig from "../models/ExamConfig.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const EXAM_DURATION_MIN = 20;

// GET /api/exam/questions
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().limit(10);

    // Don't send correct answers to client
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
    }));

    res.json({ questions: safeQuestions });
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/exam/start
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (user.hasAttempted) {
      return res
        .status(400)
        .json({ message: "You have already completed the exam." });
    }

    if (!user.startedAt) {
      user.startedAt = new Date();
      await user.save();
    }

    res.json({
      startedAt: user.startedAt,
      durationMinutes: EXAM_DURATION_MIN,
    });
  } catch (err) {
    console.error("Start exam error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/exam/submit
// body: { answers: [{ questionId, selectedIndex }] }
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { answers } = req.body;

    if (!user.startedAt) {
      return res.status(400).json({ message: "Exam not started" });
    }

    if (user.hasAttempted) {
      return res.status(400).json({ message: "Exam already submitted" });
    }

    const now = new Date();
    const diffMs = now - user.startedAt;
    const diffMinutes = diffMs / 1000 / 60;

    // Even if it's > 20 min, we still accept and score.
    const questions = await Question.find().limit(10);

    let score = 0;
    const attemptAnswers = [];

    questions.forEach((q) => {
      const found = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      const selectedIndex =
        found && typeof found.selectedIndex === "number"
          ? found.selectedIndex
          : null;

      if (selectedIndex === q.correctAnswerIndex) {
        score += 1;
      }

      attemptAnswers.push({
        question: q._id,
        selectedIndex,
      });
    });

    const config = (await ExamConfig.findOne()) || (await ExamConfig.create({ cutoff: 0 }));
    const passed = score >= (config.cutoff ?? 0);

    // Save ExamAttempt
    await ExamAttempt.create({
      user: user._id,
      answers: attemptAnswers,
      score,
      startedAt: user.startedAt,
      submittedAt: now,
    });

    user.hasAttempted = true;
    user.score = score;
    user.passed = passed;
    user.submittedAt = now;
    await user.save();

    res.json({
      score,
      totalQuestions: questions.length,
      cutoff: config.cutoff ?? 0,
      passed,
      durationMinutes: diffMinutes,
      message:
        diffMinutes > EXAM_DURATION_MIN
          ? "Submitted after time; auto-closure would have happened at 20 minutes."
          : "Submitted within time.",
    });
  } catch (err) {
    console.error("Submit exam error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/exam/result
router.get("/result", authMiddleware, async (req, res) => {
  const user = req.user;
  if (!user.hasAttempted) {
    return res.status(400).json({ message: "Exam not submitted yet." });
  }
  const config = (await ExamConfig.findOne()) || (await ExamConfig.create({ cutoff: 0 }));
  const totalQuestions = await Question.countDocuments();
  res.json({
    score: user.score,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cutoff: config.cutoff ?? 0,
    passed: user.passed ?? false,
    totalQuestions,
  });
});

export default router;
