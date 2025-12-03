import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ExamPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const startRes = await api.post("/exam/start");
        const duration = startRes.data?.durationMinutes || 20;
        setDurationMinutes(duration);
        setTimeLeft(duration * 60);
        const res = await api.get("/exam/questions");
        setQuestions(res.data.questions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert(
          err.response?.data?.message || "Error loading exam. Try again later."
        );
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading]);

  const handleOptionChange = (qId, index) => {
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  // Basic anti-copy/print shortcuts; note: screenshots cannot be fully blocked in browsers.
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handleKeydown = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "u", "c"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i", "c", "j"].includes(key))) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "PrintScreen" || e.code === "PrintScreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("keydown", handleKeydown, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("keydown", handleKeydown, true);
    };
  }, []);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedIndex:
            typeof answers[q._id] === "number" ? answers[q._id] : null,
        })),
      };

      const res = await api.post("/exam/submit", payload);
      console.log("Submit response:", res.data);
      navigate("/result");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          (auto ? "Auto submit failed" : "Submit failed")
      );
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading)
    return (
      <div className="page">
        <div className="shell">
          <div className="card">
            <p>Loading exam...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page exam-locked">
      <div className="shell">
        <div className="card action-bar">
          <div>
            <p className="eyebrow">Online Exam</p>
            <h1 className="card-title">Attempt all questions</h1>
            <p className="muted">
              Timer runs in the background. Answers will auto-submit when time ends.
              Duration: {durationMinutes} minutes.
            </p>
          </div>
          <div className={`timer-chip ${timeLeft < 60 ? "danger" : ""}`}>
            <span className="dot" />
            Time left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="question-list">
          {questions.map((q, idx) => (
            <div key={q._id} className="card question-card">
              <p className="question-title">
                <strong>Q{idx + 1}.</strong> {q.text}
              </p>
              <div className="options">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="option">
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === optIdx}
                      onChange={() => handleOptionChange(q._id, optIdx)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card action-bar">
          <div>
            <h3 style={{ margin: "0 0 4px" }}>Review & submit</h3>
            <p className="muted">You can change answers before submitting.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
