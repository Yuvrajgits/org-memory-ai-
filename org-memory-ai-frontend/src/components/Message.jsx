function Message({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="avatar">AI</div>}

      <div className="message-bubble">
        {content}
      </div>

      {isUser && <div className="avatar">You</div>}
    </div>
  );
}

export default Message;
