import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import "../styles/chat.css";

function ChatArea({ messages, loading, error, onAsk }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    if (!input.trim() || loading) return;
    onAsk(input);
    setInput("");
  }

  return (
    <main className="chat-area">
      <div className="chat-center">
        {messages.length === 0 && (
          <div className="empty-state">
            <h3>Your organizational knowledge, powered by AI</h3>
            <ul>
              <li>What’s our refund policy?</li>
              <li>Summarize the Q3 sales report</li>
              <li>What skills does Yuvraj have?</li>
            </ul>
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}

        {loading && (
          <div className="message-row assistant">
            <div className="avatar">AI</div>
            <div className="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="error-banner">
          ⚠ {error}
          <button onClick={() => submit()}>Retry</button>
        </div>
      )}

      <div className="chat-input">
        <textarea
          rows={2}
          placeholder="Ask questions about your documents, policies, or knowledge base…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="primary" onClick={submit} disabled={loading}>
          Ask
        </button>
      </div>
    </main>
  );
}

export default ChatArea;
