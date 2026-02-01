const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* -------------------- DOCUMENTS -------------------- */

export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/documents/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Upload failed");
  }

  return data;
}


export async function getDocuments() {
  const res = await fetch(`${BASE}/documents`);

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  return res.json();
}

export async function deleteDocument(filename) {
  const res = await fetch(`${BASE}/documents/${filename}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }

  // backend returns no content → don't parse JSON
  return true;
}

/* -------------------- ASK / CHAT -------------------- */

export async function askQuestion(question) {
  const res = await fetch(`${BASE}/ask/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Ask failed");
  }

  return data;
}


