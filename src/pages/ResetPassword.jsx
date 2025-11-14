// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../css/login.css"; // pakai login.css

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const presetEmail = query.get("email") || "";
  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) { setError("Email wajib diisi."); return; }
    if (!otp.trim()) { setError("Masukkan kode OTP."); return; }
    if (!newPassword || newPassword.length < 6) {
      setError("Password harus minimal 6 karakter."); return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok."); return;
    }

    setLoading(true);
    try {
      const body = {
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      const res = await axios.post(`${BASE_URL}/api/v1/auth/reset-password`, body);
      setMessage(res.data?.message || "Password berhasil diubah. Silakan login.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Reset password error:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal mereset password. Periksa OTP dan coba lagi.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <i className="fas fa-key" />
          <div>
            <h1>Reset Password</h1>
            <p>Masukkan email, kode OTP, dan password baru Anda.</p>
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

          <div className="form-group">
            <label>Kode OTP</label>
            <input
              type="text"
              value={otp}
              placeholder="Masukkan kode OTP"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password Baru</label>
            <input
              type="password"
              value={newPassword}
              placeholder="Minimal 6 karakter"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Ketik ulang password baru"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
