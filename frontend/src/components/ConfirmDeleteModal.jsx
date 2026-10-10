import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  itemName,
  itemType = "candidate", // "candidate" or "job"
  confirmText,
  isDeleting = false,
  error = null,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const defaultTitle = itemType === "job" 
    ? "Are you sure you want to delete this job?" 
    : "Are you sure you want to delete this candidate?";

  const defaultMessage = itemType === "job"
    ? "This will permanently remove the job and its related evaluation data."
    : "This will permanently remove the candidate and related evaluation data.";

  const defaultConfirmText = itemType === "job"
    ? "Delete Job"
    : "Delete Candidate";

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 120 }}>
      <div 
        className="modal-card confirm-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          padding: "26px 28px",
          background: "#ffffff",
          border: "1.5px solid var(--orange-dark)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)"
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "var(--orange-hover-bg)",
            border: "1.5px solid var(--orange-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertTriangle size={22} color="var(--orange-dark)" />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-dark)",
              margin: 0,
              lineHeight: 1.3
            }}>
              {title || defaultTitle}
            </h3>
            <p style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "6px",
              lineHeight: 1.45
            }}>
              {message || defaultMessage}
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item preview badge if provided */}
        {itemName && (
          <div style={{
            background: "#fafaf9",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            marginBottom: "18px",
            fontSize: "0.85rem",
            color: "var(--text-body)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--orange-dark)", textTransform: "uppercase" }}>
              {itemType === "job" ? "Job" : "Candidate"}:
            </span>
            <strong style={{ color: "var(--text-dark)" }}>{itemName}</strong>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: "var(--status-closed-bg)",
            border: "1px solid var(--status-closed-border)",
            color: "var(--status-closed-text)",
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "16px",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            style={{ minWidth: "90px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              minWidth: "140px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>{confirmText || defaultConfirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
