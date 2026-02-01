import UploadBox from "./UploadBox";
// import DocumentsList from "./DocumentsList";

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <h3 style={styles.title}>📁 Documents</h3>
      <UploadBox />
      {/* <DocumentsList /> */}
    </aside>
  );
}


const styles = {
  sidebar: {
    width: "280px",
    background: "#0f0f0f",
    color: "#fff",
    padding: "16px",
    borderRight: "1px solid #222",
    height: "100vh",
    overflowY: "auto",
  },
  title: {
    marginBottom: "12px",
  },
};
