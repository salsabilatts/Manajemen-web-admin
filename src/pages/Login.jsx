import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // <-- 1. IMPORT LIBRARY BARU
import "../css/login.css";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token); // Simpan token

      // --- 2. PERUBAHAN UTAMA DI SINI ---
      // Decode token untuk membaca isinya
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; // Ambil role dari payload token

      // 3. Arahkan pengguna berdasarkan role
      if (userRole === 'admin') {
        window.location.href = "/dashboard"; // Arahkan admin ke /dashboard
      } else if (userRole === 'user') {
        window.location.href = "/user-dashboard"; // Arahkan user biasa ke /user-dashboard
      } else {
        // Jika role tidak dikenal
        throw new Error("Role pengguna tidak dikenal.");
      }
      // ---------------------------------

    } catch (err) {
      // Ambil pesan error dari backend Go, atau tampilkan pesan default
      const errorMessage = err.response?.data?.error || "Email atau password salah";
      setError(errorMessage);
      console.error(err);
    }
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
            <label>Password</label>
            <input 
              type="password"
              placeholder="Masukkan password Anda"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>
        {/* --- TAMBAHKAN INI --- */}
        <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
          Belum punya akun? <Link to="/register" style={{color: '#2563eb', fontWeight: '600'}}>Daftar di sini</Link>
        </p>
        {/* --------------------- */}

      </div>
    </div>
  );
}