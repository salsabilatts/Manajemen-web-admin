// src/pages/UserDashboard.jsx (Versi Final Lengkap - Publik + Hamburger Menu)

import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Pastikan useNavigate diimport
import "../css/user-dashboard.css";
import "../css/activity.css";
import { jwtDecode } from "jwt-decode";
import bannerImage from "../assets/banner_habib.png"; // Pastikan path ini benar

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Fallback

export default function UserDashboard() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State baru untuk status login
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading awal untuk cek status
  const [activeTab, setActiveTab] = useState("layanan");
  const [activities, setActivities] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Hook untuk navigasi

  // --- FUNGSI ---
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // Set status login
    setUser(null);
    setActivities([]);
    setActiveTab("layanan"); // Kembalikan ke tab default
    setIsMobileMenuOpen(false); // Tutup menu mobile jika terbuka
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
  // --- useEffect YANG DIPERBARUI (Logika Public-First) ---
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false); // Selesai loading, status adalah 'tamu'
        setIsLoggedIn(false);
        return;
      }

      // Jika ada token, verifikasi
      setIsLoading(true);
      try {
        const fetchProfile = axios.get(`${BASE_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchActivities = axios.get(`${BASE_URL}/api/v1/submissions/`, { 
          headers: { Authorization: `Bearer ${token}` },
        });

        const [profileRes, activitiesRes] = await Promise.all([fetchProfile, fetchActivities]);

        setUser(profileRes.data);
        const userSubmissions = activitiesRes.data; 
        const sortedActivities = [...userSubmissions].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        setActivities(sortedActivities);
        
        setIsLoggedIn(true); // Login berhasil
        setIsLoading(false);
      } catch (err) {
        console.error("Gagal memuat data (token mungkin kadaluwarsa):", err);
        localStorage.removeItem("token"); // Hapus token buruk
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };
    
    checkUserStatus();
  }, []); // Hapus [token] agar hanya berjalan sekali saat mount
  // --- AKHIR useEffect ---

  // --- FUNGSI NAVIGASI PINTAR ---
  const handleNavigation = (e, path) => {
    e.preventDefault(); // Hentikan aksi <Link>
    if (!isLoggedIn) {
      alert("Anda harus login untuk mengakses fitur ini.");
      navigate('/login');
    } else {
      // Jika sudah login, lanjutkan ke halaman
      navigate(path);
    }
  };

  // Tampilkan loading awal saat cek token
  if (isLoading) {
    return <div className="loading-fullscreen">Memuat...</div>;
  }

  // --- RENDER UTAMA ---
  return (
    <div className="user-dashboard-page">
      {/* Navbar (Header) */}
      <header className="user-navbar">
        <div className="user-navbar-container">
          <div className="navbar-brand">Aspirasi Digital</div>
          
          {/* Menu Navigasi Desktop */}
          <nav className="user-nav-tabs-desktop">
            <button
              className={`user-nav-link ${activeTab === "layanan" ? "active" : ""}`}
              onClick={() => setActiveTab("layanan")}
            >
              Layanan
            </button>
            <button
              className={`user-nav-link ${activeTab === "aktivitas" ? "active" : ""}`}
              onClick={(e) => { // Dibuat "pintar"
                if (!isLoggedIn) {
                  handleNavigation(e, '/login'); 
                } else {
                  setActiveTab("aktivitas");
                }
              }}
            >
              Aktivitas
            </button>
          </nav>

          {/* Menu Profil Desktop (Dinamis) */}
          <div className="user-profile-menu-desktop">
            {isLoggedIn ? (
              <>
                <span id="user-name">{user?.full_name}</span> {/* Gunakan ? untuk safety */}
                <button onClick={logout} className="user-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="user-login-btn"> {/* Style baru .user-login-btn */}
                Login
              </Link>
            )}
          </div>

          {/* Tombol Hamburger */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
          </button>
        </div>
        
        {/* Menu Dropdown Mobile (Dinamis) */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-menu">
            <button
              className={`user-nav-link ${activeTab === "layanan" ? "active" : ""}`}
              onClick={() => { setActiveTab("layanan"); setIsMobileMenuOpen(false); }}
            >
              Layanan
            </button>
            <button
              className={`user-nav-link ${activeTab === "aktivitas" ? "active" : ""}`}
              onClick={(e) => { // Dibuat "pintar"
                if (!isLoggedIn) {
                  handleNavigation(e, '/login');
                } else {
                  setActiveTab("aktivitas");
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              Aktivitas
            </button>
            <div className="mobile-menu-divider"></div>

            {isLoggedIn ? (
              <>
                <span className="mobile-menu-user">{user?.full_name}</span>
                <button onClick={logout} className="mobile-menu-logout">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="mobile-menu-login-btn"> {/* Style baru .mobile-menu-login-btn */}
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Area Banner Gambar */}
      <div className="banner-image-container">
          <img src={bannerImage} alt="Banner Aspirasi Digital" className="main-banner-img" />
      </div>

      {/* Banner Verifikasi Email (Hanya jika login DAN belum verifikasi) */}
      {isLoggedIn && user?.email_verified_at === null && (
        <div id="verify-banner" className="verify-banner">
          {/* ... (isi banner verifikasi) ... */}
        </div>
      )}

      {/* Konten Utama */}
      <div className="user-content-area">
        <main>
          {activeTab === "layanan" && (
            <section className="user-layanan-section">
              <h2>Layanan Aspirasi</h2>
              <p>Silakan pilih layanan yang Anda butuhkan:</p>

              <div className="services-grid">
                {/* Tautan layanan dibuat "pintar" */}
                <Link to="/submission/umkm" onClick={(e) => handleNavigation(e, '/submission/umkm')} className="service-card">
                  <i className="fas fa-store"></i>
                  <span>Bantuan UMKM</span>
                </Link>
                <Link to="/submission/pendidikan" onClick={(e) => handleNavigation(e, '/submission/pendidikan')} className="service-card">
                  <i className="fas fa-school"></i>
                  <span>Bantuan Pendidikan</span>
                </Link>
                <Link to="/submission/kesehatan" onClick={(e) => handleNavigation(e, '/submission/kesehatan')} className="service-card">
                  <i className="fas fa-heartbeat"></i>
                  <span>Bantuan Kesehatan</span>
                </Link>
                <Link to="/submission/hukum" onClick={(e) => handleNavigation(e, '/submission/hukum')} className="service-card">
                  <i className="fas fa-gavel"></i>
                  <span>Bantuan Hukum</span>
                </Link>
                <Link to="/submission/sosial" onClick={(e) => handleNavigation(e, '/submission/sosial')} className="service-card">
                  <i className="fas fa-hands-helping"></i>
                  <span>Bantuan Sosial</span>
                </Link>
              </div>
            </section>
          )}

          {activeTab === "aktivitas" && (
            <section className="user-aktivitas-section">
              <h2>Riwayat Aktivitas Saya</h2>
              {/* Logika 'activities' Anda sudah benar */}
              {activities.length === 0 ? (
                <p className="no-data">Belum ada riwayat pengajuan.</p>
              ) : (
                <div className="activity-list">
                  {activities.map((activity) => (
                    <Link 
                      key={activity.ID} 
                      to={`/activity/${activity.ID}`}
                      className="activity-item-link"
                    >
                      <div className="activity-item">
                        <div className="activity-item-icon">
                           <TypeIcon type={activity.Type} />
                        </div>
                        <div classNameG="activity-details">
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