
import { useState, useEffect, useRef } from "react";
import { uploadDocument, listDocuments, deleteDocument } from "../api";

export default function FileUpload({
  activeDoc,
  onUploadSuccess,
  onSelectDoc,
  onClose,
}) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const fetchDocuments = async () => {
    try {
      const res = await listDocuments();
      setDocuments(res);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, []);

  const processFile = async (file) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setMessage("Only PDF files are supported.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage(`Processing "${file.name}"…`);
      setProgress(0);

      const res = await uploadDocument(file, setProgress);

      setStatus("success");
      setMessage(`${res.total_chunks} chunks indexed`);
      onUploadSuccess({ doc_id: res.doc_id, filename: file.name });
      fetchDocuments();
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Upload failed.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDelete = async (doc_id, filename, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${filename}"?`)) return;
    try {
      await deleteDocument(doc_id);
      setDocuments((p) => p.filter((d) => d.doc_id !== doc_id));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.panelHeader}>
        <div style={styles.panelIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span style={styles.panelTitle}>Documents</span>
        {onClose && (
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          borderColor: dragOver ? "var(--accent-cyan)" : "rgba(100,220,255,0.2)",
          background: dragOver ? "rgba(100,220,255,0.06)" : "rgba(100,220,255,0.02)",
          transform: dragOver ? "scale(1.01)" : "scale(1)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        <div style={styles.dropIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21.44 11.05l-9.19-9.19a6 6 0 0 0-8.49 8.49l8.57 8.57A4.012 4.012 0 0 0 16.95 16.95l-6.8-6.8a2.005 2.005 0 0 0-2.83 2.83l5.78 5.78" />
          </svg>
        </div>
        <div style={styles.dropTitle}>
          Drop PDF here
        </div>
        <div style={styles.dropSubtitle}>
          or click to browse
        </div>
      </div>

      {/* Status message */}
      {status !== "idle" && (
        <div style={{ ...styles.status, ...(status === "error" && styles.statusError) }}>
          {status === "uploading" && (
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          )}
          <div style={styles.statusMessage}>{message}</div>
        </div>
      )}

      {/* Document List */}
      <div style={styles.docList}>
        {documents.map((doc) => (
          <div
            key={doc.doc_id}
            style={{
              ...styles.docItem,
              ...(activeDoc?.doc_id === doc.doc_id && styles.docItemActive),
            }}
            onClick={() => onSelectDoc(doc)}
          >
            <div style={styles.docItemRow}>
              <div style={styles.docName}>{doc.filename}</div>
              <button
                className="delete-btn"
                style={styles.deleteBtn}
                onClick={(e) => handleDelete(doc.doc_id, doc.filename, e)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  panel: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "20px",
    background: "rgba(255,255,255,0.03)",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  panelIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(100,220,255,0.1)",
    border: "1px solid rgba(100,220,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-cyan)",
    flexShrink: 0,
  },
  panelTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "15px",
    color: "var(--text-primary)",
    flex: 1,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    display: "none",
    "@media(maxWidth:768px)": { display: "block" },
  },
  dropZone: {
    border: "1.5px dashed",
    borderRadius: "var(--radius-md)",
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  dropIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "rgba(100,220,255,0.08)",
    border: "1px solid rgba(100,220,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
  },
  uploadSpinner: {
    width: "24px",
    height: "24px",
    border: "2px solid rgba(100,220,255,0.2)",
    borderTopColor: "var(--accent-cyan)",
    borderRadius: "50%",
    animation: "spin-slow 0.8s linear infinite",
  },
  dropTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: "600",
    fontSize: "14px",
    color: "var(--text-primary)",
  },
  ddropSub: { fontSize: "12px", color: "var(--text-muted)" },
  progressTrack: {
    width: "100%",
    height: "3px",
    background: "rgba(100,220,255,0.1)",
    borderRadius: "99px",
    marginTop: "8px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
    borderRadius: "99px",
    transition: "width 0.3s ease",
  },
  statusMsg: {
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "500",
    fontFamily: "var(--font-mono)",
  },
  docSection: { marginTop: "4px" },
  docSectionLabel: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    fontFamily: "var(--font-display)",
    marginBottom: "10px",
  },
  docRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)",
    marginBottom: "6px",
    transition: "var(--transition)",
    cursor: "default",
  },
  docIcon: { flexShrink: 0 },
  docName: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  deleteBtn: {
    display: "none", // Hidden by default, shown on hover
    border: "none",
    background: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "var(--transition)",
    "&:hover": {
      color: "var(--accent-red)",
      background: "rgba(255,100,100,0.1)",
    },
  },
  docItem: {
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "var(--transition)",
    "&:hover": {
      background: "rgba(100,220,255,0.06)",
    },
    "&:hover .delete-btn": {
      display: "block",
    },
  },
  docItemActive: {
    background: "rgba(100,220,255,0.1)",
    boxShadow: "0 0 0 1px rgba(100,220,255,0.2), 0 1px 3px rgba(0,0,0,0.1)",
  },
  docItemRow: {
    justifyContent: "space-between",
  },
};

