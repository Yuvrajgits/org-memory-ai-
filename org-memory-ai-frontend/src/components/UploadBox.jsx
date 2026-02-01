import { uploadDocument } from "../api/backend";
import { useState } from "react";

export default function UploadBox({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadDocument(file);
      onUploadSuccess?.(result);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input
    }
  }


  return (
    <div style={styles.box}>
      <label style={styles.uploadBtn}>
        {loading ? "Uploading..." : "+ Upload document"}
        <input
          type="file"
          accept=".pdf"
          hidden
          onChange={handleFileChange}
        />
      </label>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  uploadBtn: {
    background: "#2f80ed",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
  },
};
