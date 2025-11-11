// src/pages/UserDashboard.jsx (Versi Final Lengkap)

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Pastikan sudah diimport
import "../css/user-dashboard.css"; // CSS untuk halaman ini
import "../css/activity.css"; // CSS untuk daftar aktivitas (dari langkah sebelumnya)
import { jwtDecode } from "jwt-decode";
import bannerImage from "../assets/banner_habib.png"; // Pastikan path ini benar

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Fallback

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("layanan");
  const [activities, setActivities] = useState([]);
  
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

  // --- PERBAIKAN useEffect ---
  // Mengambil data profil dan aktivitas secara bersamaan saat komponen dimuat
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    setIsLoading(true);

    // 1. Ambil data profil
    const fetchProfile = axios.get(`${BASE_URL}/api/v1/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Ambil data aktivitas (menggunakan endpoint user yang benar)
    const fetchActivities = axios.get(`${BASE_URL}/api/v1/submissions/`, { 
      headers: { Authorization: `Bearer ${token}` },
    });

    // Jalankan keduanya secara paralel
    Promise.all([fetchProfile, fetchActivities])
      .then(([profileRes, activitiesRes]) => {
        
        // Proses data profil
        setUser(profileRes.data);

        // Proses data aktivitas (backend Go mengembalikan array langsung)
        const userSubmissions = activitiesRes.data; 
        const sortedActivities = [...userSubmissions].sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
        setActivities(sortedActivities);

        setIsLoading(false); // Selesai loading
      })
      .catch((err) => {
        console.error("Gagal memuat data:", err);
        if (err.response?.status === 401) {
          logout(); // Logout paksa jika token tidak valid
        }
        setIsLoading(false);
      });
  
  }, [token]); // Dependency array hanya 'token'
  // --- AKHIR PERBAIKAN useEffect ---


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

  // Komponen StatusBadge (bisa dipindahkan ke file terpisah nanti)
  const StatusBadge = ({ status }) => {
    if (!status) return <span className="status-badge user-status">-</span>;
    const lower = status.toLowerCase();
    let cls = "status-badge user-status";
    if (["approved", "disetujui"].includes(lower)) cls += " approved";
    else if (["rejected", "ditolak"].includes(lower)) cls += " rejected";
    else cls += " review"; // default kuning
    return <span className={cls}>{status}</span>;
  };

  // Komponen Ikon (helper)
  const TypeIcon = ({ type }) => {
      let iconClass = "fas fa-file-alt"; // default
      switch (type) {
          case 'UMKM': iconClass = "fas fa-store"; break;
          case 'Pendidikan': iconClass = "fas fa-school"; break;
          case 'Kesehatan': iconClass = "fas fa-heartbeat"; break;
          case 'Hukum': iconClass = "fas fa-gavel"; break;
          case 'Sosial': iconClass = "fas fa-users"; break;
      }
      return <i className={iconClass}></i>;
  };


  return (
    <div className="user-dashboard-page">
      {/* Navbar (Header) */}
      <header className="user-navbar">
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
      <div className="banner-image-container">
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
      <div className="user-content-area">
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
                  {/* --- PERUBAHAN: Item sekarang bisa diklik --- */}
                  {activities.map((activity) => (
                    <Link 
                      key={activity.ID} 
                      to={`/activity/${activity.ID}`} // Link ke halaman detail
                      className="activity-item-link" // Class untuk hapus style link
                    >
                      <div className="activity-item">
                        <div className="activity-item-icon">
                           <TypeIcon type={activity.Type} />
                        </div>
                        <div className="activity-details">
                          <h4>Pengajuan {activity.Type}</h4>
                          <p>Diajukan: {formatDateTime(activity.CreatedAt)}</p>
                        </div>
                        <div className="activity-item-status">
                           <StatusBadge status={activity.Status} />
                           <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    </Link>
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