import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_USERNAME = "admin_tex";
const ADMIN_PASSWORD = "admin@123";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      navigate("/admin");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
          <p className="eyebrow">Admin Portal</p>
          <h1 className="card-title">Sign in</h1>
          <p className="muted">Restricted access. Authorized personnel only.</p>

          <form onSubmit={handleSubmit} className="form" style={{ marginTop: 16 }}>
            <label className="field">
              <span>Username</span>
              <input
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_tex"
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            {error && <div className="alert">{error}</div>}
            <button type="submit" className="btn btn-primary full-width">
              Login
            </button>
            <p className="helper">
              Default credentials: admin_tex / admin@123
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
