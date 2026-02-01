import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../api/backend";
import TypingIndicator from "../components/TypingIndicator";
import ErrorBanner from "../components/ErrorBanner";

/* ---------- Helper ---------- */
function confidenceColor(level) {
  if (level === "high") return "#27ae60";
  if (level === "medium" || level === "medium-high") return "#f2c94c";
  return "#eb5757";
}

/* ---------- Component ---------- */
export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk() {
    if (!question.trim() || loading) return;

    const userText = question;
    setQuestion("");
    setError(null);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
    ]);

    setLoading(true);

    try {
      const res = await askQuestion(userText);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          confidence: res.confidence,
          sources: res.sources_used,
        },
      ]);
   } catch (err) {
  const apiError = err?.response?.data || err?.detail;

  if (apiError?.error_code === "NO_DOCUMENTS") {
    setError("Please upload at least one document before asking questions.");
  } else if (apiError?.error_code === "EMPTY_QUESTION") {
    setError("Please type a question first.");
  } else {
    setError("Something went wrong. Please try again.");
  }
}
finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatContainer}>
        {/* EMPTY STATE */}
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <h2>Your organizational knowledge, powered by AI</h2>
            <p>Try asking:</p>
            <ul>
              <li>Summarize the uploaded document</li>
              <li>What skills are mentioned?</li>
              <li>Explain the key points</li>
            </ul>
          </div>
        )}

        {/* MESSAGES */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#2f80ed" : "#2a2a2a",
              color: msg.role === "user" ? "#fff" : "#eaeaea",
            }}
          >
            <div>{msg.text}</div>

            {msg.role === "assistant" && (
              <details style={styles.details}>
                <summary style={styles.summary}>Why this answer?</summary>
                <div style={styles.explainBox}>
                  <p>
                    <strong>Confidence:</strong>{" "}
                    <span
                      style={{
                        color: confidenceColor(msg.confidence),
                        fontWeight: 600,
                      }}
                    >
                      {msg.confidence}
                    </span>
                  </p>

                  {msg.sources?.length > 0 && (
                    <p>
                      <strong>Sources:</strong>{" "}
                      {msg.sources.map((s) => `Chunk ${s + 1}`).join(", ")}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />

        {/* INPUT */}
        <div style={styles.inputBox}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask questions about your documents..."
            rows={3}
            style={styles.textarea}
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            style={{
              ...styles.askButton,
              opacity: loading ? 0.6 : 1,
            }}
          >
            Ask
          </button>
        </div>

        {error && <ErrorBanner message={error} />}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#121212",
    padding: "40px 20px",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "720px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyState: {
    background: "#1f1f1f",
    padding: "24px",
    borderRadius: "10px",
    color: "#ccc",
  },
  message: {
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: "12px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  inputBox: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  textarea: {
    flex: 1,
    background: "#2a2a2a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "8px",
    padding: "10px",
    resize: "none",
  },
  askButton: {
    background: "#2f80ed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0 20px",
    fontWeight: "600",
    cursor: "pointer",
  },
  details: {
    marginTop: "8px",
    fontSize: "13px",
  },
  summary: {
    cursor: "pointer",
    color: "#9bbcff",
    fontWeight: "600",
  },
  explainBox: {
    marginTop: "8px",
    padding: "10px",
    background: "#1f1f1f",
    borderRadius: "8px",
    border: "1px solid #333",
    color: "#ccc",
  },
};
