import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom"; // Import Link dan useNavigate
import "../css/login.css"; // Pastikan CSS ini diimpor

// Ambil BASE_URL dari environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const navigate = useNavigate(); // Hook untuk navigasi

  // --- Penjaga Rute ---
  // Cek apakah user sudah login saat halaman ini dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
        
        // Jika sudah login, tendang ke dasbor yang sesuai
        if (userRole === 'admin') {
          navigate("/dashboard"); // Dasbor Admin
        } else {
          navigate("/"); // Dasbor User (halaman utama)
        }
      } catch (e) {
        // Token tidak valid, hapus
        localStorage.removeItem("token");
      }
    }
  }, [navigate]); // Tambahkan navigate ke dependency array

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Mulai loading

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token); // Simpan token

      // Decode token untuk membaca isinya
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; // Ambil role dari payload token

      // Arahkan pengguna berdasarkan role
      if (userRole === 'admin') {
        window.location.href = "/dashboard"; // Arahkan admin ke /dashboard
      } else if (userRole === 'user') {
        window.location.href = "/"; // Arahkan user biasa ke Halaman Utama (/)
      } else {
        throw new Error("Role pengguna tidak dikenal.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || "Email atau password salah";
      setError(errorMessage);
      console.error(err);
      setIsLoading(false); // Hentikan loading jika gagal
    }
    // Jangan set isLoading(false) di sini jika sukses, karena halaman akan redirect
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-header">
          <i className="fas fa-users"></i>
          <h1>Membership System</h1>
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
              {/* --- TAMBAHKAN LINK LUPA PASSWORD --- */}
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