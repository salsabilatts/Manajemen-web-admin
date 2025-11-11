// src/pages/UserDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Asumsi teman Anda pakai React Router
import "../css/style.css"; // Menggunakan CSS yang sama

// Ambil BASE_URL dari file .env React (VITE_API_URL)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Fallback

export default function UserDashboard() {
  // State untuk menyimpan data user
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = localStorage.getItem("token"); // Ambil token (sesuaikan key-nya)

  // Fungsi Logout
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Arahkan ke halaman login
  };

  // Fungsi untuk kirim ulang email verifikasi
  const resendVerificationEmail = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/resend-verification`,
        {}, // Body kosong
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Email verifikasi terkirim!");
    } catch (err) {
      console.error("Gagal mengirim ulang email:", err);
      alert(err.response?.data?.error || "Gagal mengirim ulang email.");
    }
  };

  // Ambil data profil saat halaman dimuat
  useEffect(() => {
    if (!token) {
      window.location.href = "/"; // Balik ke login jika tidak ada token
      return;
    }

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
          // Jika token tidak valid, logout paksa
          logout();
        }
        setIsLoading(false);
      });
  }, [token]);

  // Tampilkan loading
  if (isLoading) {
    return <div className="loading-fullscreen">Memuat data pengguna...</div>;
  }

  // Tampilkan jika user gagal dimuat
  if (!user) {
    return <div className="loading-fullscreen">Gagal memuat data. Silakan login kembali.</div>;
  }

  return (
    <div className="app-container">
      {/* Navbar (Header) */}
      <header className="navbar">
        <div className="container">
          <div className="navbar-brand">Aspirasi Digital</div>
          <div className="navbar-menu">
            <span id="user-name">{user.full_name}</span>
            <button onClick={logout} className="nav-link logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

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

      {/* Konten Utama */}
      <div className="container page-container">
        <main>
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
              <i className="fas fa-users"></i>
              <span>Bantuan Sosial</span>
            </Link>
            <Link
              to="/activity"
              className="service-card"
              style={{ backgroundColor: "#f0f0f0" }}
            >
              <i className="fas fa-history"></i>
              <span>Riwayat Pengajuan Saya</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}