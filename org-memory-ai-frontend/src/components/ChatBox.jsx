import { useState } from "react";
import { askQuestion } from "../api/backend";

export default function ChatBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askQuestion(question);
      setAnswer(data);
    } catch (err) {
      setError(err.message || "Failed to get answer");
    } finally {
      setLoading(false); // ✅ ALWAYS stops loader
    }
  }

  return (
    <div className="chat-box">
      <textarea
        rows={4}
        placeholder="Ask questions about your documents, policies, or knowledge base..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && <p className="error">{error}</p>}

      {answer && (
        <div className="answer">
          <p>{answer.answer}</p>
          <small>
            Confidence: {answer.confidence} · Model: {answer.model}
          </small>
        </div>
      )}
    </div>
  );
}
