import { useEffect, useState } from "react";
import api from "../api";

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "admin-123"; // must match backend ADMIN_SECRET

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [appearedCount, setAppearedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cutoff, setCutoff] = useState(0);
  const [savingCutoff, setSavingCutoff] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState(["", "", "", ""]);
  const [editCorrectIndex, setEditCorrectIndex] = useState(0);

  const adminHeaders = {
    "x-admin-secret": ADMIN_SECRET,
  };

  const loadQuestions = async () => {
    const res = await api.get("/admin/questions", { headers: adminHeaders });
    setQuestions(res.data);
  };

  const loadResults = async () => {
    const res = await api.get("/admin/results", { headers: adminHeaders });
    setResults(res.data.users || []);
    setAppearedCount(res.data.appeared || 0);
    setTotalCount(res.data.total || 0);
  };

  const loadConfig = async () => {
    const res = await api.get("/admin/config", { headers: adminHeaders });
    setCutoff(res.data.cutoff ?? 0);
  };

  useEffect(() => {
    loadQuestions();
    loadResults();
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadUsers = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await api.post("/admin/upload-users", formData, {
      headers: {
        ...adminHeaders,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Users uploaded/updated");
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    await api.post(
      "/admin/questions",
      { text: qText, options, correctAnswerIndex: correctIndex },
      { headers: adminHeaders }
    );
    setQText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    await loadQuestions();
  };

  const handleDeleteQuestion = async (id) => {
    await api.delete(`/admin/questions/${id}`, { headers: adminHeaders });
    await loadQuestions();
  };

  const handleStartEdit = (q) => {
    setEditingId(q._id);
    setEditText(q.text);
    setEditOptions(q.options?.length ? q.options : ["", "", "", ""]);
    setEditCorrectIndex(q.correctAnswerIndex ?? 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditOptions(["", "", "", ""]);
    setEditCorrectIndex(0);
  };

  const handleSaveEdit = async (id) => {
    await api.patch(
      `/admin/questions/${id}`,
      {
        text: editText,
        options: editOptions,
        correctAnswerIndex: editCorrectIndex,
      },
      { headers: adminHeaders }
    );
    handleCancelEdit();
    await loadQuestions();
  };

  const handleSaveCutoff = async (e) => {
    e.preventDefault();
    setSavingCutoff(true);
    try {
      await api.post(
        "/admin/config",
        { cutoff: Number(cutoff) || 0 },
        { headers: adminHeaders }
      );
      await loadConfig();
    } finally {
      setSavingCutoff(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin-login";
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="card action-bar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="card-title">Exam Control Center</h1>
            <p className="muted">
              Manage candidates, curate questions, and monitor live results.
            </p>
          </div>
          <div className="stack" style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <span className="pill">Secure access</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="grid two-col">
          <section className="card">
            <div className="section-heading">
              <h3 style={{ margin: 0 }}>Pass Cutoff</h3>
              <span className="tag">Score</span>
            </div>
            <form onSubmit={handleSaveCutoff} className="form">
              <label className="field">
                <span>Minimum correct answers to pass</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={questions.length || 10}
                  value={cutoff}
                  onChange={(e) => setCutoff(e.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-primary">
                {savingCutoff ? "Saving..." : "Save Cutoff"}
              </button>
              <p className="helper">
                Candidates with scores below this number will be marked as fail.
              </p>
            </form>
          </section>

          <section className="card">
            <div className="section-heading">
              <h3 style={{ margin: 0 }}>Upload Allowed Users</h3>
              <span className="tag">Excel</span>
            </div>
            <form onSubmit={handleUploadUsers} className="form">
              <label className="field">
                <span>Upload Excel (.xlsx or .xls)</span>
                <input
                  className="input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Upload List
              </button>
              <p className="helper">
                Excel must have columns: <strong>name</strong>, <strong>email</strong>, <strong>phone</strong>
              </p>
            </form>
          </section>

          <section className="card">
            <div className="section-heading">
              <h3 style={{ margin: 0 }}>Create Question</h3>
              <span className="tag">MCQ</span>
            </div>
            <form
              onSubmit={handleCreateQuestion}
              className="form"
              style={{ marginTop: 4 }}
            >
              <label className="field">
                <span>Question text</span>
                <textarea
                  className="input"
                  placeholder="Add the question prompt"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  required
                />
              </label>
              {options.map((opt, idx) => (
                <label key={idx} className="field">
                  <span>Option {idx + 1}</span>
                  <input
                    className="input"
                    placeholder={`Enter option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                  />
                </label>
              ))}
              <label className="field">
                <span>Correct option index (0-3)</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={3}
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(parseInt(e.target.value, 10))}
                />
              </label>
              <button type="submit" className="btn btn-secondary">
                Add Question
              </button>
            </form>
          </section>
        </div>

        <section className="card">
          <div className="section-heading">
            <h3 style={{ margin: 0 }}>Questions ({questions.length})</h3>
            <span className="tag">Live</span>
          </div>
          <div className="stack">
            {questions.map((q, idx) => (
              <div
                key={q._id}
                className="card"
                style={{ padding: 14, boxShadow: "none" }}
              >
                {editingId === q._id ? (
                  <div className="stack">
                    <div className="action-bar">
                      <div>
                        <p className="muted" style={{ margin: 0 }}>
                          Editing Question {idx + 1}
                        </p>
                      </div>
                      <div className="stack" style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn btn-ghost" onClick={handleCancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSaveEdit(q._id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <label className="field">
                      <span>Question text</span>
                      <textarea
                        className="input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                    </label>
                    {editOptions.map((opt, i) => (
                      <label key={i} className="field">
                        <span>Option {i + 1}</span>
                        <input
                          className="input"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...editOptions];
                            copy[i] = e.target.value;
                            setEditOptions(copy);
                          }}
                        />
                      </label>
                    ))}
                    <label className="field">
                      <span>Correct option index (0-3)</span>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        max={3}
                        value={editCorrectIndex}
                        onChange={(e) =>
                          setEditCorrectIndex(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="action-bar">
                      <div>
                        <p className="muted" style={{ margin: 0 }}>
                          Question {idx + 1}
                        </p>
                        <strong>{q.text}</strong>
                      </div>
                      <div className="stack" style={{ flexDirection: "row", gap: 8 }}>
                        <button className="btn btn-ghost" onClick={() => handleStartEdit(q)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleDeleteQuestion(q._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <ul className="list" style={{ marginTop: 8 }}>
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          {i === q.correctAnswerIndex ? <strong>{opt} (correct)</strong> : opt}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h3 style={{ margin: 0 }}>Results</h3>
              <p className="muted" style={{ margin: 0 }}>
                {appearedCount} out of {totalCount} appeared for exam
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name || "-"}</td>
                    <td>{r.email}</td>
                    <td>{r.phone}</td>
                    <td>{r.hasAttempted ? r.score : "-"}</td>
                    <td>
                      {r.hasAttempted ? (r.passed ? "Pass" : "Fail") : "Not attempted"}
                    </td>
                    <td>
                      {r.submittedAt
                        ? new Date(r.submittedAt).toLocaleString()
                        : r.hasAttempted
                        ? "Submitted"
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
