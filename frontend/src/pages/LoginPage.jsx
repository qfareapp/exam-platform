import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, phone });
      localStorage.setItem("exam_token", res.data.token);
      localStorage.setItem("exam_user", JSON.stringify(res.data.user));

      if (res.data.user.hasAttempted) {
        // Already attempted ƒ+' go to result
        navigate("/result");
      } else {
        navigate("/instructions");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <p className="eyebrow">Candidate Portal</p>
          <h1 className="card-title">Exam Login</h1>
          <p className="muted">
            Use the same Email and Phone Number shared with the exam admin.
          </p>

          <form onSubmit={handleLogin} className="form" style={{ marginTop: 16 }}>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Phone Number</span>
              <input
                className="input"
                type="text"
                placeholder="Enter registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
            {error && <div className="alert">{error}</div>}
            <button type="submit" className="btn btn-primary full-width">
              Login and Continue
            </button>
            <p className="helper">
              Only one attempt is allowed. Make sure your details match the list provided
              by the admin.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
