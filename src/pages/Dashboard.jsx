import { useEffect, useState } from "react";
import axios from "axios";
import "../css/style.css"; // pakai css lama
// pastikan FA sudah di <head> index.html via CDN

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_anggota_aktif: 0,
    pelaku_umkm: 0,
    pengajuan_menunggu: 0,
    total_saldo_emoney: 0,
  });
  const [activities, setActivities] = useState([]);
  const [todayTransactions, setTodayTransactions] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/"; // balik ke login
      return;
    }

    // 1) Stats
    axios
      .get(`${BASE_URL}/api/v1/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Gagal memuat statistik dashboard:", err));

    // 2) Aktivitas terbaru
    axios
      .get(`${BASE_URL}/api/v1/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const submissions = res.data?.data || res.data || [];
        // urutkan terbaru
        const sorted = [...submissions].sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
        // ambil 20 terakhir (ikut native)
        setActivities(sorted.slice(0, 20));

        // 3) Transaksi hari ini
        const today = new Date().toISOString().split("T")[0];
        const todayOnly = submissions.filter((s) =>
          (s.CreatedAt || "").startsWith(today)
        );
        setTodayTransactions(todayOnly);
      })
      .catch((err) => {
        console.error("Gagal memuat aktivitas/transaksi:", err);
        setActivities([]);
        setTodayTransactions([]);
      });
  }, [token]);

  const formatIDR = (n) =>
    `Rp ${Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const StatusBadge = ({ status }) => {
    if (!status) return <span className="status-badge">-</span>;
    const lower = status.toLowerCase();
    let cls = "status-badge";
    if (["approved", "disetujui"].includes(lower)) cls += " approved";
    else if (["rejected", "ditolak"].includes(lower)) cls += " rejected";
    else cls += " review"; // default kuning
    return <span className={cls}>{status}</span>;
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-users"></i>
          <div>
            <h2>Membership</h2>
            <p>Management System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a href="/users" className="nav-item">
            <i className="fas fa-users-cog"></i>
            <span>Manajemen User</span>
          </a>
          <a href="/umkm" className="nav-item">
            <i className="fas fa-store"></i>
            <span>UMKM</span>
          </a>
          <a href="/pendidikan" className="nav-item">
            <i className="fas fa-graduation-cap"></i>
            <span>Pendidikan</span>
          </a>
          <a href="/kesehatan" className="nav-item">
            <i className="fas fa-heartbeat"></i>
            <span>Kesehatan</span>
          </a>
          <a href="/hukum" className="nav-item">
            <i className="fas fa-balance-scale"></i>
            <span>Bantuan Hukum</span>
          </a>
          <a href="/sosial" className="nav-item">
            <i className="fas fa-hands-helping"></i>
            <span>Sosial</span>
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Selamat Datang Admin</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>
          <div className="top-bar-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
            </button>
            <div className="user-profile">
              <div className="user-avatar">AL</div>
              <div className="user-info">
                <span id="userEmailShort">Admin</span>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            <button className="logout-btn" id="logoutBtn" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3 id="totalAnggota">{stats.total_anggota_aktif}</h3>
              <p>Total Anggota Aktif</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-store"></i>
            </div>
            <div className="stat-content">
              <h3 id="pelakuUmkm">{stats.pelaku_umkm}</h3>
              <p>Pelaku UMKM</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3 id="pengajuanMenunggu">{stats.pengajuan_menunggu}</h3>
              <p>Pengajuan Menunggu</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="stat-content">
              <h3 id="totalSaldo">{formatIDR(stats.total_saldo_emoney)}</h3>
              <p>Total Saldo E-Money</p>
            </div>
          </div>
        </section>

        {/* Aktivitas Terbaru */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Aktivitas Terbaru</h2>
            <a href="#" className="view-all">
              <i className="fas fa-list"></i> Lihat Semua
            </a>
          </div>
          <div className="table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>WAKTU</th>
                  <th>USER</th>
                  <th>AKTIVITAS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody id="activityTableBody">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      Belum ada aktivitas
                    </td>
                  </tr>
                ) : (
                  activities.map((sub, idx) => (
                    <tr key={idx}>
                      <td>
                        {new Date(sub.CreatedAt).toLocaleString("id-ID")}
                      </td>
                      <td>{sub.User?.full_name || "Tidak diketahui"}</td>
                      <td>{sub.Type || "-"}</td>
                      <td>
                        <StatusBadge status={sub.Status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transaksi Hari Ini */}
        <section className="bottom-section">
          <div className="transaksi-hari-ini">
            <h3>Transaksi Hari Ini</h3>
            <div className="transaksi-list" id="transaksiList">
              {todayTransactions.length === 0 ? (
                <p className="no-data">Belum ada transaksi</p>
              ) : (
                todayTransactions.map((sub, i) => (
                  <div className="transaksi-item" key={i}>
                    <p>
                      <strong>
                        {sub.User?.full_name || "User Tidak Dikenal"}
                      </strong>{" "}
                      - {sub.FormData?.["Nama Usaha"] || "N/A"}
                    </p>
                    <small>
                      {new Date(sub.CreatedAt).toLocaleTimeString("id-ID")} |
                      Status: {sub.Status}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}