
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isTyping = message.typing;

  return (
    <div style={{
      ...styles.row,
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "slide-up 0.3s ease forwards",
    }}>
      {/* Avatar */}
      <div style={{
        ...styles.avatar,
        background: isUser
          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
          : "linear-gradient(135deg,rgba(100,220,255,0.15),rgba(167,139,250,0.15))",
        border: isUser
          ? "none"
          : "1px solid rgba(100,220,255,0.25)",
        boxShadow: isUser
          ? "none"
          : "0 0 12px rgba(100,220,255,0.15)",
      }}>
        {isUser ? "👤" : "🧠"}
      </div>

      {/* Bubble */}
      <div style={{
        ...styles.bubble,
        background: isUser
          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
          : "rgba(255,255,255,0.04)",
        border: isUser ? "none" : "1px solid var(--border)",
        borderRadius: isUser
          ? "18px 4px 18px 18px"
          : "4px 18px 18px 18px",
        boxShadow: isUser
          ? "0 4px 20px rgba(99,102,241,0.35)"
          : "var(--shadow-card)",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        {isTyping ? (
          <div style={styles.typingWrap}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                ...styles.typingDot,
                animationDelay: `${i * 0.18}s`,
              }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{
              ...styles.content,
              color: isUser ? "#fff" : "var(--text-primary)",
            }}>
              {isUser
                ? <p style={{ margin: 0, lineHeight: 1.6 }}>{message.content}</p>
                : <ReactMarkdown>{message.content}</ReactMarkdown>
              }
            </div>

            {/* Source citations */}
            {!isUser && message.sources?.length > 0 && (
              <div style={styles.sources}>
                <p style={styles.sourcesLabel}>
                  <svg style={{ marginRight: "5px", verticalAlign: "middle" }}
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Sources
                </p>
                <div style={styles.sourceTags}>
                  {message.sources.map((s, i) => (
                    <span key={i} style={styles.sourceTag}>
                      pg.{s.page} · {Math.round(s.score * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            <span style={{
              ...styles.time,
              color: isUser ? "rgba(255,255,255,0.5)" : "var(--text-muted)",
              alignSelf: isUser ? "flex-end" : "flex-start",
            }}>
              {message.time}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    marginBottom: "20px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "72%",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backdropFilter: "blur(12px)",
  },
  content: {
    fontSize: "14px",
    lineHeight: "1.7",
    fontFamily: "var(--font-body)",
  },
  typingWrap: {
    display: "flex",
    gap: "5px",
    padding: "4px 0",
    alignItems: "center",
  },
  typingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "var(--accent-cyan)",
    animation: "typing-dot 1.2s infinite",
  },
  sources: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    paddingTop: "10px",
    marginTop: "4px",
  },
  sourcesLabel: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
    fontFamily: "var(--font-display)",
    marginBottom: "7px",
    textTransform: "uppercase",
  },
  sourceTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  sourceTag: {
    padding: "3px 10px",
    background: "rgba(100,220,255,0.08)",
    border: "1px solid rgba(100,220,255,0.2)",
    borderRadius: "99px",
    fontSize: "11px",
    color: "var(--accent-cyan)",
    fontFamily: "var(--font-mono)",
    fontWeight: "500",
  },
  time: {
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
  },
};