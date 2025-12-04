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
      bg.src = "/certificate.png";

      await new Promise((resolve, reject) => {
        bg.onload = resolve;
        bg.onerror = () =>
          reject(new Error("Certificate template (certificate.png) not found or failed to load"));
      });

      canvas.width = bg.naturalWidth || 4871;
      canvas.height = bg.naturalHeight || 3444;
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Overlay only name and date on top of the provided template
      const baseWidth = 4871;
      const scale = canvas.width / baseWidth;
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";

      const displayName =
        result.name?.trim() ||
        result.email?.split("@")[0] ||
        result.phone ||
        "Candidate";

      // Scale name text so it fits within the center ribbon area
      const nameFontFamily = '"Times New Roman", "Georgia", serif';
      let nameFontSize = Math.round(180 * scale);
      const maxNameWidth = canvas.width * 0.7;
      ctx.font = `bold ${nameFontSize}px ${nameFontFamily}`;
      while (ctx.measureText(displayName).width > maxNameWidth && nameFontSize > 48 * scale) {
        nameFontSize -= 2;
        ctx.font = `bold ${Math.round(nameFontSize)}px ${nameFontFamily}`;
      }
      ctx.fillText(displayName, canvas.width / 2, canvas.height * 0.53);

      const dateText = `Date: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`;
      ctx.font = `${Math.round(80 * scale)}px ${nameFontFamily}`;
      ctx.fillText(dateText, canvas.width / 2, canvas.height * 0.7);

      const baseName = (displayName || "candidate").replace(/[^a-z0-9]/gi, "_");

      const link = document.createElement("a");
      link.download = `${baseName}-certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Certificate generation failed", err);
      alert(
        err.message || "Unable to generate certificate. Please ensure certificate.png is present."
      );
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
