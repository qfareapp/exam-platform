import { useEffect, useState, useCallback } from "react";
import api from "../api";

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/exam/result");
        setResult(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load result");
      }
    };
    load();
  }, []);

  const handleDownloadCertificate = useCallback(async () => {
    if (!result?.passed) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.src = "/preview.jpg";

      await new Promise((resolve, reject) => {
        bg.onload = resolve;
        bg.onerror = () =>
          reject(new Error("Certificate template (preview.jpg) not found or failed to load"));
      });

      canvas.width = bg.naturalWidth || 1600;
      canvas.height = bg.naturalHeight || 1131;
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Overlay text
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";

      ctx.font = "48px Manrope, sans-serif";
      ctx.fillText("Certificate of Achievement", canvas.width / 2, canvas.height * 0.32);

      ctx.font = "36px Manrope, sans-serif";
      ctx.fillText("Awarded to", canvas.width / 2, canvas.height * 0.42);

      ctx.font = "54px Manrope, sans-serif";
      const displayName =
        result.name?.trim() ||
        result.email?.split("@")[0] ||
        result.phone ||
        "Candidate";
      ctx.fillText(displayName, canvas.width / 2, canvas.height * 0.5);

      ctx.font = "28px Manrope, sans-serif";
      const msg =
        "Congratulations on successfully completing the CANDO & 5S Visual Management Training.";
      ctx.fillText(msg, canvas.width / 2, canvas.height * 0.6);
      ctx.font = "24px Manrope, sans-serif";
      const msg2 = "Your dedication and active participation are truly appreciated.";
      ctx.fillText(msg2, canvas.width / 2, canvas.height * 0.65);

      ctx.font = "22px Manrope, sans-serif";
      const date = new Date().toLocaleDateString();
      ctx.fillText(`Date: ${date}`, canvas.width / 2, canvas.height * 0.72);

      const baseName = (displayName || "candidate").replace(/[^a-z0-9]/gi, "_");

      const link = document.createElement("a");
      link.download = `${baseName}-certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Certificate generation failed", err);
      alert(err.message || "Unable to generate certificate. Please ensure preview.jpg is present.");
    }
  }, [result]);

  if (error)
    return (
      <div className="page">
        <div className="shell">
          <div className="alert">{error}</div>
        </div>
      </div>
    );
  if (!result)
    return (
      <div className="page">
        <div className="shell">
          <div className="card">
            <p>Loading result...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="shell">
        <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <p className="eyebrow">Exam Result</p>
          <h1 className="card-title">Your performance</h1>
          <p className="muted">
            {result.passed
              ? "Congratulations on clearing the cutoff!"
              : "You can review your score below."}
          </p>

          <div className="grid two-col" style={{ marginTop: 16 }}>
            <div className="callout">
              <strong>Name:</strong> {result.name || "Candidate"}
              <br />
              <strong>Email:</strong> {result.email}
              <br />
              <strong>Phone:</strong> {result.phone}
            </div>
            <div className="callout" style={{ background: "#ecfdf3", borderColor: "#bbf7d0" }}>
              <strong>Score:</strong> {result.score} / {result.totalQuestions || 10}
              <br />
              <strong>Cutoff:</strong> {result.cutoff ?? 0}
            </div>
          </div>

          <div
            className="card"
            style={{
              marginTop: 14,
              background: result.passed ? "#ecfdf3" : "#fef2f2",
              borderColor: result.passed ? "#bbf7d0" : "#fecdd3",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {result.passed ? "Status: Pass" : "Status: Fail"}
            </h3>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              {result.passed
                ? "You met or exceeded the required cutoff."
                : "Score is below the required cutoff."}
            </p>
            {result.passed && (
              <button
                className="btn btn-primary full-width"
                style={{ marginTop: 12 }}
                onClick={handleDownloadCertificate}
              >
                Download Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
