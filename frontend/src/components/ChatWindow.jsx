// frontend/src/components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api";
import MessageBubble from "./MessageBubble";


const GENERIC_SUGGESTIONS = [
  "Give me a summary of this document",
  "What are the key topics covered?",
  "What are the main conclusions?",
  "List the important points",
  "What does this document talk about?",
];

export default function ChatWindow({ activeDoc, onMenuOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(GENERIC_SUGGESTIONS);
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Welcome to **GenAI Doc Assistant**!\n\nUpload any PDF from the sidebar — a research paper, textbook, report, legal doc, manual, or anything — and I'll answer your questions about it with exact page citations.",
        sources: [],
        time: getTime(),
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  useEffect(() => {
    if (activeDoc) {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: `✅ You're now chatting with **"${activeDoc.filename}"**.\n\nAsk me anything — definitions, summaries, specific sections, comparisons, or any question you have.`,
          sources: [],
          time: getTime(),
        },
      ]);
      
      setSuggestions(GENERIC_SUGGESTIONS);
    }
  }, [activeDoc]);

  const send = async (q) => {
    const question = (q || input).trim();
    if (!question || loading) return;

    setMessages((p) => [
      ...p,
      { role: "user", content: question, time: getTime() },
    ]);
    setInput("");
    setLoading(true);

    
    setMessages((p) => [
      ...p,
      { role: "assistant", typing: true, time: getTime() },
    ]);

    try {
      const data = await askQuestion(question, activeDoc?.doc_id);

      setMessages((p) => [
        ...p.slice(0, -1),
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          time: getTime(),
        },
      ]);
    } catch (err) {
      setMessages((p) => [
        ...p.slice(0, -1),
        {
          role: "assistant",
          content:
            "**Error:** " +
            (err.response?.data?.detail ||
              "Backend not reachable. Make sure it's running on port 8000."),
          sources: [],
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
      textRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! Upload a PDF from the sidebar and ask me anything.",
        sources: [],
        time: getTime(),
      },
    ]);
  };


  const hasUserMessage = messages.some((m) => m.role === "user");

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <button style={styles.menuBtn} onClick={onMenuOpen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={styles.navBrand}>
            <div style={styles.navDot} />
            <span style={styles.navTitle}>GenAI Doc Assistant</span>
          </div>
        </div>

        <div style={styles.navRight}>
          {/* Shows whichever doc is currently active */}
          {activeDoc && (
            <div style={styles.activeDocBadge}>
              <div style={styles.activeDot} />
              <span style={styles.activeDocName}>{activeDoc.filename}</span>
            </div>
          )}
          <button style={styles.clearBtn} onClick={clearChat} title="Clear chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Generic suggestion chips — shown before any question is asked */}
        {!hasUserMessage && (
          <div style={styles.suggestions}>
            <p style={styles.suggestLabel}>
              {activeDoc ? "Try asking:" : "Once you upload a PDF, try:"}
            </p>
            <div style={styles.suggestGrid}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.suggestBtn,
                    opacity: activeDoc ? 1 : 0.4,
                    cursor: activeDoc ? "pointer" : "not-allowed",
                  }}
                  onClick={() => activeDoc && send(s)}
                  title={activeDoc ? s : "Upload a PDF first"}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        {/* Warning if no doc uploaded */}
        {!activeDoc && (
          <div style={styles.noDocWarning}>
            ⚠️ Upload a PDF first to start asking questions
          </div>
        )}

        <div style={{
          ...styles.inputWrap,
          borderColor: activeDoc
            ? "rgba(100,220,255,0.25)"
            : "rgba(255,255,255,0.08)",
          opacity: 1,
        }}>
          <textarea
            ref={textRef}
            style={styles.textarea}
            value={input}
            rows={1}
            placeholder={
              activeDoc
                ? `Ask anything about "${activeDoc.filename}"…`
                : "Upload a PDF first, then ask your question…"
            }
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: !input.trim() || loading ? 0.4 : 1,
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p style={styles.inputHint}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    background: "rgba(5,8,22,0.8)",
    backdropFilter: "blur(20px)",
    flexShrink: 0,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--accent-cyan)",
    boxShadow: "0 0 8px var(--accent-cyan)",
    animation: "pulse-glow 2s ease-in-out infinite",
  },
  navTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "16px",
    background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  activeDocBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    background: "rgba(100,220,255,0.07)",
    border: "1px solid rgba(100,220,255,0.2)",
    borderRadius: "99px",
    maxWidth: "220px",
  },
  activeDocName: {
    fontSize: "11px",
    color: "var(--accent-cyan)",
    fontFamily: "var(--font-mono)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  activeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--accent-green)",
    boxShadow: "0 0 6px var(--accent-green)",
    flexShrink: 0,
    animation: "pulse-glow 2s ease-in-out infinite",
  },

  clearBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 20px",
  },
  suggestions: {
    marginTop: "8px",
    animation: "fade-in 0.5s ease",
  },
  suggestLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-display)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  suggestGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  suggestBtn: {
    padding: "8px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)",
    borderRadius: "99px",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    transition: "var(--transition)",
  },
  inputArea: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "rgba(5,8,22,0.8)",
    backdropFilter: "blur(20px)",
    flexShrink: 0,
  },
  noDocWarning: {
    fontSize: "11px",
    color: "#f59e0b",
    fontFamily: "var(--font-mono)",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 12px",
    marginBottom: "10px",
    textAlign: "center",
  },
  inputWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid",
    borderRadius: "var(--radius-md)",
    padding: "10px 10px 10px 16px",
    transition: "var(--transition)",
  },
  textarea: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "none",
    minHeight: "24px",
    maxHeight: "120px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
    border: "none",
    color: "#050816",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition)",
    flexShrink: 0,
  },
  inputHint: {
    fontSize: "10px",
    color: "var(--text-muted)",
    marginTop: "8px",
    textAlign: "center",
    fontFamily: "var(--font-mono)",
  },
};