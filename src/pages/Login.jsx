import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import "../css/login.css";

// Ambil BASE_URL dari environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- Penjaga Rute ---
  // Cek apakah user sudah login saat halaman ini dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
        
        // --- PERUBAHAN 1: Cek Role Baru ---
        // Jika rolenya adalah salah satu dari admin, arahkan ke dasbor admin
        if (userRole === 'admin_wilayah' || userRole === 'super_admin') {
          navigate("/dashboard"); // Dasbor Admin
        } else {
          navigate("/"); // Dasbor User (halaman utama)
        }
      } catch (e) {
        // Token tidak valid, hapus
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token); // Simpan token

      // --- PERUBAHAN 2: Decode dan Simpan Info Tambahan ---
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      const wilayahTugas = decodedToken.wilayah_tugas || ""; // Ambil wilayah (atau string kosong)

      // Simpan role & wilayah ke localStorage agar bisa dibaca halaman lain
      localStorage.setItem("user_role", userRole);
      localStorage.setItem("wilayah_tugas", wilayahTugas);
      // ----------------------------------------------------

      // --- PERUBAHAN 3: Arahkan Pengguna Berdasarkan Role Baru ---
      if (userRole === 'admin_wilayah' || userRole === 'super_admin') {
        window.location.href = "/dashboard"; // Arahkan semua jenis admin ke /dashboard
      } else if (userRole === 'user') {
        window.location.href = "/"; // Arahkan user biasa ke Halaman Utama (/)
      } else {
        throw new Error("Role pengguna tidak dikenal.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || "Email atau password salah";
      setError(errorMessage);
      console.error(err);
      setIsLoading(false); 
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-header">
          <i className="fas fa-users"></i>
          <h1>Aspirasi Digital</h1> {/* Ganti dari Membership System */}
          <p>Silakan login untuk melanjutkan</p>
        </div>

        {error && <div className="error-message show">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              placeholder="Masukkan email Anda"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}
              >
                Lupa Password?
              </Link>
            </div>
            <input 
              type="password"
              placeholder="Masukkan password Anda"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
          Belum punya akun? <Link to="/register" style={{color: '#2563eb', fontWeight: '600'}}>Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}