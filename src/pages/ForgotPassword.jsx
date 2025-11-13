// src/pages/ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css"; // pakai login.css

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Masukkan email.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Format email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/forgot-password`, {
        email: email.trim(),
      });

      setMessage(res.data?.message || "Permintaan dikirim. Cek email untuk OTP.");
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1200);
    } catch (err) {
      console.error("Forgot password error:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal mengirim permintaan. Coba lagi.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <i className="fas fa-unlock-alt" />
          <div>
            <h1>Lupa Password</h1>
            <p>Masukkan email terdaftar. Kami akan mengirimkan OTP ke email Anda.</p>
          </div>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="email@contoh.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim OTP ke Email"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
