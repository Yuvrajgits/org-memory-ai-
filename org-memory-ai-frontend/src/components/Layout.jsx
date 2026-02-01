import Sidebar from "./Sidebar";
import Chat from "../pages/Chat";

export default function Layout() {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <Chat />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    width: "100vw",
    minHeight: "100vh",
    background: "#121212", // 🔥 kills white area globally
  },
  main: {
    flex: 1,
    background: "#121212",
    overflowY: "auto",
  },
};
