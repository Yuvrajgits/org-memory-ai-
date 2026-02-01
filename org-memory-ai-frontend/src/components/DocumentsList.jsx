import { useEffect, useState } from "react";
import { getDocuments, deleteDocument } from "../api/backend";

export default function DocumentsList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  loadDocuments();
}, []); // ✅ VERY IMPORTANT


  async function fetchDocs() {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(filename) {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      await deleteDocument(filename);
      setDocs((prev) => prev.filter((d) => d !== filename));
    } catch {
      alert("Delete failed");
    }
  }

  if (loading) {
    return <p style={{ color: "#aaa" }}>Loading documents…</p>;
  }

  if (docs.length === 0) {
    return <p style={{ color: "#777" }}>No documents uploaded</p>;
  }

  return (
    <ul style={styles.list}>
      {docs.map((doc) => (
        <li key={doc} style={styles.item}>
          <span>{doc}</span>
          <button onClick={() => handleDelete(doc)} style={styles.delete}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

const styles = {
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "12px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1f1f1f",
    padding: "6px 8px",
    borderRadius: "6px",
    marginBottom: "6px",
    fontSize: "14px",
  },
  delete: {
    background: "transparent",
    border: "none",
    color: "#ff6b6b",
    cursor: "pointer",
    fontSize: "14px",
  },
};
