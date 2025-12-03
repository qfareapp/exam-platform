import { useNavigate } from "react-router-dom";

export default function InstructionPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/exam");
  };

  const handleScheduleLater = () => {
    localStorage.removeItem("exam_token");
    localStorage.removeItem("exam_user");
    navigate("/");
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="card">
          <p className="eyebrow">📝 Exam Instructions</p>
          <h1 className="card-title">Please read all instructions carefully</h1>
          <p className="muted">
            You have one attempt. The timer starts once you enter the exam. Make sure you
            understand the rules before clicking Start.
          </p>

          <div className="stack" style={{ marginTop: 16 }}>
            <InstructionSection
              title="1. Login & Eligibility"
              points={[
                "You must log in using the same Email and Phone Number submitted by the Admin.",
                "If your details do not match, you will not be able to access the exam.",
              ]}
            />
            <InstructionSection
              title="2. Exam Format"
              points={[
                "The exam contains 10 Multiple Choice Questions (MCQs).",
                "Each question has 4 options and only one option is correct.",
                "There is no negative marking.",
              ]}
            />
            <InstructionSection
              title="3. Duration"
              points={[
                "Total exam duration is 20 minutes.",
                "The timer starts immediately after you enter the exam page.",
                "When the timer ends, your answers will be auto-submitted even if you have not clicked Submit.",
              ]}
            />
            <InstructionSection
              title="4. Navigation & Answering"
              points={[
                "All 10 questions are displayed on one page.",
                "Click on the radio button to select your answer.",
                "You can change your answer before submitting.",
                "Ensure you attempt all questions before the time runs out.",
              ]}
            />
            <InstructionSection
              title="5. Submission Rules"
              points={[
                "You can manually click Submit anytime before the timer ends.",
                "If you do not submit in time, the system will auto-submit your current answers.",
                "After submission, your exam cannot be reattempted.",
                "Your score will be shown immediately after submission.",
              ]}
            />
            <InstructionSection
              title="6. Do Not Refresh or Close the Browser"
              points={[
                "Refreshing or closing the browser will not reset the timer.",
                "Your timer continues in the background.",
                "Multiple logins are not allowed once the exam starts.",
              ]}
            />
            <InstructionSection
              title="7. Technical Requirements"
              points={[
                "Use the latest version of Chrome, Firefox, or Edge.",
                "Ensure a stable internet connection.",
                "Do not open the exam in multiple tabs or devices.",
              ]}
            />
            <InstructionSection
              title="8. Honesty Policy"
              points={[
                "This is an independently attempted assessment.",
                "Do not take help from others or external materials.",
                "Any malpractice may result in disqualification.",
              ]}
            />
          </div>

          <div className="callout" style={{ marginTop: 18 }}>
            <strong>Ready?</strong> Click “Start Exam” when you are prepared, or choose “Schedule Later” to come back.
          </div>

          <button className="btn btn-primary full-width" onClick={handleStart} style={{ marginTop: 16 }}>
            Start Exam
          </button>
          <button
            className="btn btn-ghost full-width"
            onClick={handleScheduleLater}
            style={{ marginTop: 10 }}
          >
            Schedule Later
          </button>
        </div>
      </div>
    </div>
  );
}

function InstructionSection({ title, points }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>{title}</h3>
      <ul className="list">
        {points.map((p, idx) => (
          <li key={idx}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
