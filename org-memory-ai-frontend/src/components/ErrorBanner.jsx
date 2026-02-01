export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={styles.banner}>
      <span style={styles.text}>{message}</span>

      {onRetry && (
        <button style={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

const styles = {
  banner: {
    background: "#2a1f1f",
    border: "1px solid #eb5757",
    color: "#f2b8b8",
    padding: "10px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "12px",
  },
  text: {
    fontSize: "14px",
  },
  retryBtn: {
    background: "transparent",
    border: "1px solid #eb5757",
    color: "#eb5757",
    padding: "4px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
