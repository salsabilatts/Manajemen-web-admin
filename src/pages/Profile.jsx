// src/pages/Profile.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/user-dashboard.css"; // Kita pakai CSS user dashboard
import "../css/profile.css"; // Kita buat CSS baru untuk halaman ini

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Arahkan ke /login (karena / adalah dasbor publik)
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // Wajib login untuk lihat profil
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
        if (err.response?.status === 401) logout();
        setIsLoading(false);
      });
  }, [token]);

  if (isLoading) {
    return <div className="loading-fullscreen">Memuat data profil...</div>;
  }

  if (!user) {
    return <div className="loading-fullscreen">Gagal memuat data. Silakan login kembali.</div>;
  }

  return (
    <div className="user-dashboard-page">
      {/* Navbar (Header) */}
      <header className="user-navbar">
        <div className="user-navbar-container">
          <Link to="/" className="navbar-brand">Aspirasi Digital</Link>
          <nav className="user-nav-tabs">
            <Link to="/" className="user-nav-link">
              Layanan
            </Link>
            <Link to="/" onClick={(e) => {
                e.preventDefault(); 
                localStorage.setItem('lastTab', 'aktivitas'); 
                navigate('/');
              }} className="user-nav-link">
              Aktivitas
            </Link>
          </nav>
          <div className="user-profile-menu">
            <span id="user-name" style={{fontWeight: 'bold'}}>{user.full_name}</span>
            <button onClick={logout} className="user-logout-btn">
              Logout
            </button>
          </div>
          {/* Tambahkan hamburger menu jika perlu */}
        </div>
      </header>

      {/* Konten Utama Halaman Profil */}
      <div className="user-content-area">
        <main>
          <div className="profile-container">
            {/* --- TOMBOL KEMBALI --- */}
              <Link to="/" className="link-back">
                <i className="fas fa-arrow-left"></i> Kembali ke Dasbor
              </Link>
              {/* --------------------- */}
            <div className="profile-header">
              <h2>Profil Saya</h2>
              <Link to="/profile/edit" className="profile-edit-btn">
                <i className="fas fa-pencil-alt"></i> Edit Profil
              </Link>
            </div>

            {/* Bagian Data Diri */}
            <div className="profile-section">
              <h4>Data Diri</h4>
              <div className="profile-detail-item">
                <span className="profile-label">Nama Lengkap</span>
                <span className="profile-value">{user.full_name}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-label">Nomor HP</span>
                <span className="profile-value">{user.phone || '-'}</span>
              </div>
            </div>

            {/* Bagian Alamat */}
            <div className="profile-section">
              <h4>Alamat Domisili</h4>
              <div className="profile-detail-item">
                <span className="profile-label">Provinsi</span>
                <span className="profile-value">{user.provinsi || '-'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-label">Kabupaten/Kota</span>
                <span className="profile-value">{user.kabupaten || '-'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-label">Kecamatan</span>
                <span className="profile-value">{user.kecamatan || '-'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-label">Kelurahan/Desa</span>
                <span className="profile-value">{user.kelurahan || '-'}</span>
              </div>
            </div>

            {/* Bagian Keamanan & Kartu */}
{/* Bagian Keamanan (Hanya Password) */}
            <div className="profile-section">
              <h4>Keamanan</h4>
              <div className="profile-detail-item">
                <span className="profile-label">Password</span>
                <Link to="/profile/change-password" className="link-small" style={{color: '#FF6600'}}>
                  Ubah Password
                </Link>
              </div>
            </div>

            {/* Bagian Kartu Anggota (BARU & TERPISAH) */}
            <div className="profile-section">
              <h4>Kartu Tanda Anggota (NFC)</h4>
              
              {/* Gunakan class baru 'nfc-card' dan ubah style berdasarkan status */}
              <div className={`nfc-card ${user.card_uid ? 'linked' : 'unlinked'}`}>
                <div className="nfc-card-icon">
                  {user.card_uid ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="fas fa-times-circle"></i>
                  )}
                </div>
                <div className="nfc-card-content">
                  <strong>
                    {user.card_uid ? `Terhubung (UID: ****${user.card_uid.slice(-4)})` : 'Belum Terhubung'}
                  </strong>
                  <small>
                    Penautan kartu E-Money hanya dapat dilakukan melalui aplikasi mobile.
                  </small>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}