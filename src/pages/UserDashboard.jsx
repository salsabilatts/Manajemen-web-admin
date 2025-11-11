// src/pages/UserDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Pastikan sudah diimport
import "../css/user-dashboard.css";
import { jwtDecode } from "jwt-decode"; // Untuk decode token
import bannerImage from "../assets/banner_habib.png";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Fallback

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("layanan"); // State untuk tab aktif: 'layanan' atau 'aktivitas'
  const [activities, setActivities] = useState([]); // State untuk aktivitas
  
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const resendVerificationEmail = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/resend-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Email verifikasi terkirim!");
    } catch (err) {
      console.error("Gagal mengirim ulang email:", err);
      alert(err.response?.data?.error || "Gagal mengirim ulang email.");
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    // Fetch user profile
    axios
      .get(`${BASE_URL}/api/v1/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat profil:", err);
        if (err.response?.status === 401) {
          logout();
        }
        setIsLoading(false);
      });

    // Fetch activities (hanya jika tab aktif adalah 'aktivitas' atau saat pertama kali load)
    if (activeTab === "aktivitas" || !activities.length) {
        axios
          .get(`${BASE_URL}/api/v1/user/submissions`, { // Ganti endpoint jika ada endpoint khusus user
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const userSubmissions = res.data?.data || res.data || [];
            // Urutkan dari terbaru
            const sortedActivities = [...userSubmissions].sort(
              (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
            );
            setActivities(sortedActivities);
          })
          .catch((err) => {
            console.error("Gagal memuat aktivitas:", err);
            setActivities([]); // Kosongkan jika gagal
          });
    }
  }, [token, activeTab, activities.length]); // Tambahkan activeTab ke dependency array

  if (isLoading) {
    return <div className="loading-fullscreen">Memuat data pengguna...</div>;
  }

  if (!user) {
    return <div className="loading-fullscreen">Gagal memuat data. Silakan login kembali.</div>;
  }

  // Helper untuk format waktu
  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusBadge = ({ status }) => {
    if (!status) return <span className="status-badge user-status">-</span>;
    const lower = status.toLowerCase();
    let cls = "status-badge user-status";
    if (["approved", "disetujui"].includes(lower)) cls += " approved";
    else if (["rejected", "ditolak"].includes(lower)) cls += " rejected";
    else cls += " review"; // default kuning
    return <span className={cls}>{status}</span>;
  };


  return (
    <div className="user-dashboard-page">
      {/* Navbar (Header) */}
      <header className="user-navbar"> {/* Ganti class dari 'navbar' menjadi 'user-navbar' */}
        <div className="user-navbar-container">
          <div className="navbar-brand">Aspirasi Digital</div>
          <nav className="user-nav-tabs">
            <button
              className={`user-nav-link ${activeTab === "layanan" ? "active" : ""}`}
              onClick={() => setActiveTab("layanan")}
            >
              Layanan
            </button>
            <button
              className={`user-nav-link ${activeTab === "aktivitas" ? "active" : ""}`}
              onClick={() => setActiveTab("aktivitas")}
            >
              Aktivitas
            </button>
          </nav>
          <div className="user-profile-menu">
            <span id="user-name">{user.full_name}</span>
            <button onClick={logout} className="user-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Area Banner Gambar */}
      <div className="banner-image-container"> {/* <-- KONTEN BARU UNTUK GAMBAR BANNER */}
          <img src={bannerImage} alt="Banner Aspirasi Digital" className="main-banner-img" />
      </div>

      {/* Banner Verifikasi Email */}
      {user.email_verified_at === null && (
        <div id="verify-banner" className="verify-banner">
          <i className="fas fa-exclamation-triangle"></i>
          Email Anda belum terverifikasi. Beberapa fitur mungkin terbatas.
          <button
            onClick={resendVerificationEmail}
            className="link-small"
          >
            Kirim ulang email?
          </button>
        </div>
      )}

      {/* Konten Utama - Disini kita pisahkan berdasarkan tab */}
      <div className="user-content-area"> {/* Tambahkan class user-content-area */}
        <main>
          {activeTab === "layanan" && (
            <section className="user-layanan-section">
              <h2>Layanan Aspirasi</h2>
              <p>Silakan pilih layanan yang Anda butuhkan:</p>

              <div className="services-grid">
                <Link to="/submission/umkm" className="service-card">
                  <i className="fas fa-store"></i>
                  <span>Bantuan UMKM</span>
                </Link>
                <Link to="/submission/pendidikan" className="service-card">
                  <i className="fas fa-school"></i>
                  <span>Bantuan Pendidikan</span>
                </Link>
                <Link to="/submission/kesehatan" className="service-card">
                  <i className="fas fa-heartbeat"></i>
                  <span>Bantuan Kesehatan</span>
                </Link>
                <Link to="/submission/hukum" className="service-card">
                  <i className="fas fa-gavel"></i>
                  <span>Bantuan Hukum</span>
                </Link>
                <Link to="/submission/sosial" className="service-card">
                  <i className="fas fa-hands-helping"></i>
                  <span>Bantuan Sosial</span>
                </Link>
              </div>
            </section>
          )}

          {activeTab === "aktivitas" && (
            <section className="user-aktivitas-section">
              <h2>Riwayat Aktivitas Saya</h2>
              {activities.length === 0 ? (
                <p className="no-data">Belum ada riwayat pengajuan.</p>
              ) : (
                <div className="activity-list">
                  {activities.map((activity) => (
                    <div key={activity.ID} className="activity-item">
                      <div className="activity-details">
                        <h4>{activity.Type || "Pengajuan Tanpa Tipe"}</h4>
                        <p>Diajukan: {formatDateTime(activity.CreatedAt)}</p>
                        {activity.Status === "approved" && activity.ApprovedAt && (
                          <p>Disetujui: {formatDateTime(activity.ApprovedAt)}</p>
                        )}
                        {activity.Status === "rejected" && activity.RejectedAt && (
                          <p>Ditolak: {formatDateTime(activity.RejectedAt)}</p>
                        )}
                      </div>
                      <StatusBadge status={activity.Status} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}