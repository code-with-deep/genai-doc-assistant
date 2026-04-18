import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [activeDoc, setActiveDoc] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSetDoc = (doc) => {
    setActiveDoc(doc);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={styles.root}>
      {/* Ambient background orbs */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />

      <div style={styles.layout}>
        {/* ── SIDEBAR ── */}
        <aside style={{
          ...styles.sidebar,
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: sidebarOpen ? "0" : "-100%",
            height: "100%",
            zIndex: 100,
            width: "300px",
            transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
            background: "#07091a",
            boxShadow: sidebarOpen ? "4px 0 40px rgba(0,0,0,0.6)" : "none",
          } : {}),
        }}>
          <FileUpload
            activeDoc={activeDoc}
            onUploadSuccess={handleSetDoc}
            onSelectDoc={handleSetDoc}
            onClose={isMobile ? () => setSidebarOpen(false) : null}
          />
        </aside>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            style={styles.overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── CHAT ── */}
        <main style={styles.chat}>
          <ChatWindow
            activeDoc={activeDoc}
            onMenuOpen={() => setSidebarOpen(true)}
          />
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg-deep)",
  },
  /* Ambient glow orbs */
  orb: {
    position: "fixed",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
    animation: "float 8s ease-in-out infinite",
  },
  orb1: {
    width: "500px",
    height: "500px",
    background: "rgba(99,102,241,0.12)",
    top: "-150px",
    left: "-150px",
    animationDelay: "0s",
  },
  orb2: {
    width: "400px",
    height: "400px",
    background: "rgba(100,220,255,0.08)",
    bottom: "-100px",
    right: "10%",
    animationDelay: "3s",
  },
  orb3: {
    width: "300px",
    height: "300px",
    background: "rgba(167,139,250,0.07)",
    top: "40%",
    left: "30%",
    animationDelay: "6s",
  },
  layout: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    height: "100vh",
    width: "100%",
  },
  sidebar: {
    width: "280px",
    flexShrink: 0,
    height: "100%",
    borderRight: "1px solid var(--border)",
  },
  chat: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 99,
    backdropFilter: "blur(4px)",
  },
};