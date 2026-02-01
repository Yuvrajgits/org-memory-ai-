export default function TypingIndicator() {
  return (
    <div style={styles.container}>
      <span>Assistant is typing</span>
      <span style={styles.dots}>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}

const styles = {
  container: {
    color: "#aaa",
    fontSize: "14px",
    marginTop: "4px",
  },
  dots: {
    display: "inline-block",
    marginLeft: "6px",
  },
};
