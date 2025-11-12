// src/components/UserNavbar.jsx

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
// Import CSS-nya
import "../css/user-dashboard.css"; 

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function UserNavbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mendapatkan URL saat ini

  // Ambil data user untuk nama di navbar
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Kita tidak perlu fetch /profile lagi jika hanya butuh nama
        // Tapi untuk konsistensi, kita fetch:
        axios.get(`${BASE_URL}/api/v1/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setUser(res.data))
          .catch(logout); // Logout jika token error
      } catch (e) {
        logout(); // Token rusak
      }
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Arahkan ke login
  };

  // Tentukan tab aktif berdasarkan URL
  const getActiveTab = () => {
    if (location.pathname === "/") return "layanan";
    if (location.pathname.startsWith("/activity")) return "aktivitas";
    // Jika di /profile atau /profile/edit, dll, tidak ada yang aktif
    return ""; 
  };
  
  const activeTab = getActiveTab();

  // Jika tidak ada user (loading atau belum login), tampilkan navbar minimal
  if (!user) {
     return (
        <header className="user-navbar">
          <div className="user-navbar-container">
            <Link to="/" className="navbar-brand">Aspirasi Digital</Link>
            <Link to="/login" className="user-login-btn" style={{padding: '0.5rem 1rem'}}>
              Login
            </Link>
          </div>
        </header>
     );
  }

  // Render navbar lengkap jika user sudah ada
  return (
    <header className="user-navbar">
      <div className="user-navbar-container">
        <Link to="/" className="navbar-brand">Aspirasi Digital</Link>
        
        {/* Menu Navigasi Desktop */}
        <nav className="user-nav-tabs-desktop">
          <Link
            to="/"
            className={`user-nav-link ${activeTab === "layanan" ? "active" : ""}`}
          >
            Layanan
          </Link>
          <Link
            to="/activity" // Kita ubah ini agar 'Aktivitas' punya halaman sendiri
            className={`user-nav-link ${activeTab === "aktivitas" ? "active" : ""}`}
          >
            Aktivitas
          </Link>
        </nav>

        {/* Menu Profil Desktop */}
        <div className="user-profile-menu-desktop">
          <Link to="/profile" className="user-name-link" title="Lihat Profil">
            {user.full_name}
          </Link>
          <button onClick={logout} className="user-logout-btn">
            Logout
          </button>
        </div>

        {/* Tombol Hamburger (Mobile) */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
        </button>
      </div>
      
      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          <Link
            to="/"
            className={`user-nav-link ${activeTab === "layanan" ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Layanan
          </Link>
          <Link
            to="/activity"
            className={`user-nav-link ${activeTab === "aktivitas" ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Aktivitas
          </Link>
          <div className="mobile-menu-divider"></div>
          <Link to="/profile" className="mobile-menu-user" onClick={() => setIsMobileMenuOpen(false)}>
            {user.full_name} (Lihat Profil)
          </Link>
          <button onClick={logout} className="mobile-menu-logout">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}