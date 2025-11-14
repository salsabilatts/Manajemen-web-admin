import React from "react";
import "../css/confirm-modal.css"; 

export default function ConfirmModal({ open, title, message, onCancel, onConfirm, loading=false }) {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <div className="confirm-header">
          <h3>{title || "Konfirmasi"}</h3>
        </div>
        <div className="confirm-body">
          <p>{message || "Apakah Anda yakin?"}</p>
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Memproses..." : "Ya, Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
