import { useState } from "react";
import axios from "axios";
import "../css/login.css";

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

      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";

    } catch (err) {
      setError("Email atau password salah");
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

      </div>
    </div>
  );
}