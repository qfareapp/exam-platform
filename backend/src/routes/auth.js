import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/login { email, phone }
router.post("/login", async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ message: "Email and phone are required" });
  }

  try {
    // User must already exist (uploaded by admin via Excel)
    let user = await User.findOne({ email, phone });

    if (!user) {
      return res
        .status(401)
        .json({ message: "You are not authorized for this exam." });
    }

    if (!user.allowed) {
      return res
        .status(403)
        .json({ message: "You are not allowed to take this exam." });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasAttempted: user.hasAttempted,
        score: user.score,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
