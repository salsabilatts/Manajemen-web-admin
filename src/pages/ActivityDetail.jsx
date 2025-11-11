// src/pages/ActivityDetail.jsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/user-dashboard.css"; // CSS utama
import "../css/activity.css"; // CSS untuk badge status
import "../css/activity-detail.css"; // CSS baru untuk halaman ini

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper StatusBadge (bisa dipindah ke file terpisah)
const StatusBadge = ({ status }) => {
  if (!status) return <span className="status-badge user-status">-</span>;
  const lower = status.toLowerCase();
  let cls = "status-badge user-status";
  if (["approved", "disetujui"].includes(lower)) cls += " approved";
  else if (["rejected", "ditolak"].includes(lower)) cls += " rejected";
  else cls += " review";
  return <span className={cls}>{status}</span>;
};

// Helper Format Tanggal
const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function ActivityDetail() {
  const { id } = useParams(); // Ambil 'id' dari URL
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    
    if (!id) {
        setError("ID Pengajuan tidak ditemukan.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    axios
      .get(`${BASE_URL}/api/v1/submissions/${id}`, { // Panggil API detail
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Backend Go kita mengembalikan objek submission lengkap
        setSubmission(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat detail aktivitas:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
        setError("Gagal memuat data atau pengajuan tidak ditemukan.");
        setIsLoading(false);
      });
  }, [token, id]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  
  // Fungsi untuk render data form secara dinamis
  const renderFormData = (formData) => {
    if (!formData) return null;
    
    // Ambil path dokumen, lalu hapus dari map agar tidak ikut di-render
    const documentPath = formData.document_path;
    delete formData.document_path;
    
    return (
      <>
        {Object.entries(formData).map(([key, value]) => (
          <div className="detail-item" key={key}>
            <span className="detail-label">{key}</span>
            <span className="detail-value">{value}</span>
          </div>
        ))}
        {documentPath && (
          <div className="detail-item">
            <span className="detail-label">Dokumen Pendukung</span>
            <span className="detail-value">
              {/* TODO: Ganti ini dengan link ke API GetFile admin */}
              <a href={`${BASE_URL}/api/v1/admin/files/${documentPath.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                Lihat Dokumen (Membutuhkan Login Admin)
              </a>
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="user-dashboard-page">
      {/* Navbar (Header) */}
      <header className="user-navbar">
        <div className="user-navbar-container">
          <Link to="/user-dashboard" className="navbar-brand">Aspirasi Digital</Link>
          <nav className="user-nav-tabs">
            <Link to="/user-dashboard" className="user-nav-link" onClick={() => localStorage.setItem('lastTab', 'layanan')}>
              Layanan
            </Link>
            <Link to="/user-dashboard" className="user-nav-link active" onClick={() => localStorage.setItem('lastTab', 'aktivitas')}>
              Aktivitas
            </Link>
          </nav>
          <div className="user-profile-menu">
            <button onClick={logout} className="user-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="user-content-area">
        <main>
          {isLoading && (
            <div className="loading-fullscreen" style={{height: '50vh'}}>Memuat detail pengajuan...</div>
          )}

          {!isLoading && error && (
            <p className="no-data" style={{color: 'red'}}>{error}</p>
          )}

          {!isLoading && submission && (
            <div className="detail-container">
              {/* Tombol Kembali */}
              <Link to="/user-dashboard" onClick={() => localStorage.setItem('lastTab', 'aktivitas')} className="link-back">
                <i className="fas fa-arrow-left"></i> Kembali ke Riwayat
              </Link>
            
              <div className="detail-header">
                <h3>Detail Pengajuan {submission.Type}</h3>
                <StatusBadge status={submission.Status} />
              </div>
              <span className="card-date">Diajukan pada: {formatDateTime(submission.CreatedAt)}</span>
              
              <div className="detail-section">
                <h4>Data Pengajuan</h4>
                {renderFormData(submission.FormData)}
              </div>
              
              <div className="detail-section">
                <h4>Riwayat Status (Timeline)</h4>
                <ul className="timeline">
                  {submission.StatusHistories.length > 0 ? (
                    submission.StatusHistories.map((history) => (
                      <li className="timeline-item" key={history.ID}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="timeline-status">{history.Status}</span>
                          <span className="timeline-date">{formatDateTime(history.CreatedAt)}</span>
                          {history.Notes && (
                            <p className="timeline-notes">"{history.Notes}"</p>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p>Belum ada riwayat status.</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}