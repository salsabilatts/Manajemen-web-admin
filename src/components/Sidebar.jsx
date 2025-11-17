import { useState } from "react";
import "../css/sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Tombol toggle sidebar */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Header Logo */}
      {isOpen && (
        <div className="sidebar-header">
          <i className="fas fa-users"></i>
          <div>
            <h2>Membership</h2>
            <p>Management System</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <a href="/dashboard" className="nav-item">
          <i className="fas fa-home"></i>
          {isOpen && <span>Dashboard</span>}
        </a>

        <a href="/users" className="nav-item">
          <i className="fas fa-users-cog"></i>
          {isOpen && <span>Manajemen User</span>}
        </a>

        <a href="/umkm" className="nav-item">
          <i className="fas fa-store"></i>
          {isOpen && <span>UMKM</span>}
        </a>

        <a href="/pendidikan" className="nav-item">
          <i className="fas fa-graduation-cap"></i>
          {isOpen && <span>Pendidikan</span>}
        </a>

        <a href="/kesehatan" className="nav-item">
          <i className="fas fa-heartbeat"></i>
          {isOpen && <span>Kesehatan</span>}
        </a>

        <a href="/hukum" className="nav-item">
          <i className="fas fa-balance-scale"></i>
          {isOpen && <span>Bantuan Hukum</span>}
        </a>

        <a href="/sosial" className="nav-item">
          <i className="fas fa-hands-helping"></i>
          {isOpen && <span>Sosial</span>}
        </a>
      </nav>
    </aside>
  );
}