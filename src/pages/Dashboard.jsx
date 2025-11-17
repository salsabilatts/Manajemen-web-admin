import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../css/style.css"; // pakai css lama
import Pagination from "../components/Pagination.jsx";
import Sidebar from "../components/Sidebar.jsx";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_anggota_aktif: 0,
    total_pengajuan: 0,
    pengajuan_menunggu: 0,
    pengajuan_diterima: 0,
    pengajuan_ditolak: 0,
  });
  const [activities, setActivities] = useState([]);
  const [todayTransactions, setTodayTransactions] = useState([]);

  // --- PERUBAHAN 2: Tambah State untuk Data Admin ---
  const [adminName, setAdminName] = useState("Admin"); // Default
  // Pagination for Aktivitas Terbaru
  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPageActivity = 10;

  // Pagination for Transaksi Hari Ini
  const [transPage, setTransPage] = useState(1);
  const itemsPerPageTrans = 5;
  // === Aktivitas Terbaru ===
  const indexOfLastActivity = activityPage * itemsPerPageActivity;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPageActivity;
  const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);

  // === Transaksi Hari Ini ===
  const indexOfLastTrans = transPage * itemsPerPageTrans;
  const indexOfFirstTrans = indexOfLastTrans - itemsPerPageTrans;
  const currentTrans = todayTransactions.slice(indexOfFirstTrans, indexOfLastTrans);

  const token = localStorage.getItem("token");

useEffect(() => {
  if (!token) {
    window.location.href = "/";
    return;
  }

try {
      const decoded = jwtDecode(token);
      // --- PERUBAHAN 3: Cek Role Baru ---
      if (decoded?.role !== 'admin_wilayah' && decoded?.role !== 'super_admin') {
        window.location.href = "/"; // Tendang jika bukan admin
        return;
      }
      // Ambil nama dari token untuk sapaan
      if (decoded?.full_name) {
        setAdminName(decoded.full_name.split(' ')[0]); // Ambil nama depan
      }
      // ---------------------------------
  } catch (e) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  // === new: fetch dashboard stats + submissions in parallel ===
  const fetchStats = axios.get(`${BASE_URL}/api/v1/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchSubmissions = axios.get(`${BASE_URL}/api/v1/admin/submissions?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  Promise.all([fetchStats, fetchSubmissions])
    .then(([statsRes, subsRes]) => {
      // 1) stats
      // backend kamu mengembalikan object langsung seperti di Postman,
      // jadi gunakan statsRes.data (atau statsRes.data.data jika backend bungkus)
      const statsData = statsRes.data?.data || statsRes.data || {};
        setStats({
          total_anggota_aktif:
            statsData.total_anggota_aktif ?? stats.total_anggota_aktif,
          total_pengajuan: statsData.total_pengajuan ?? stats.total_pengajuan,
          pengajuan_menunggu:
            statsData.pengajuan_menunggu ?? stats.pengajuan_menunggu,
          pengajuan_diterima:
            statsData.pengajuan_diterima ?? stats.pengajuan_diterima,
          pengajuan_ditolak:
            statsData.pengajuan_ditolak ?? stats.pengajuan_ditolak,
        });

      // 2) submissions -> activities & todayTransactions (kamu sudah punya logic)
// --- PERUBAHAN 4: Parsing Data Go ---
        const submissions = subsRes.data || []; // Backend Go kirim array langsung
        // ------------------------------------
      const sorted = [...submissions].sort(
        (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
      );
      setActivities(sorted.slice(0, 20));
      const today = new Date().toISOString().split("T")[0];
      const todayOnly = submissions.filter((s) =>
        (s.CreatedAt || "").startsWith(today)
      );
      setTodayTransactions(todayOnly);
    })
    .catch((err) => {
      console.error("Gagal memuat data dashboard:", err);
      // tetap set default agar UI tidak crash
      setStats({
          total_anggota_aktif: 0,
          total_pengajuan: 0,
          pengajuan_menunggu: 0,
          pengajuan_diterima: 0,
          pengajuan_ditolak: 0,
      });
      setActivities([]);
      setTodayTransactions([]);
    });
}, [token]);


  // const formatIDR = (n) =>
  //   `Rp ${Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role"); // Hapus juga cache role
    localStorage.removeItem("wilayah_tugas"); // Hapus juga cache wilayah
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
     <Sidebar />
      {/* Main */}
      <main className="main-content main-with-sidebar">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Selamat Datang {adminName}</h1>
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
            <div className="stat-icon purple">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stat-content">
              <h3 id="totalPengajuan">{stats.total_pengajuan}</h3>
              <p>Total Pengajuan</p>
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
            <div className="stat-icon green">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3 id="pengajuanDiterima">{stats.pengajuan_diterima}</h3>
              <p>Pengajuan Diterima</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-content">
              <h3 id="pengajuanDitolak">{stats.pengajuan_ditolak}</h3>
              <p>Pengajuan Ditolak</p>
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
                {currentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      Belum ada aktivitas
                    </td>
                  </tr>
                ) : (
                  currentActivities.map((sub, idx) => (
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
            <div className="pagination-wrapper">
              <Pagination
              currentPage={activityPage}
              totalItems={activities.length}
              itemsPerPage={itemsPerPageActivity}
              onPageChange={(page) => setActivityPage(page)}
              />
            </div>
        </section>

        {/* Transaksi Hari Ini */}
        <section className="bottom-section">
          <div className="transaksi-hari-ini">
            <h3>Transaksi Hari Ini</h3>
            <div className="transaksi-list" id="transaksiList">
              {currentTrans.length === 0 ? (
                <p className="no-data">Belum ada transaksi</p>
              ) : (
                currentTrans.map((sub, i) => (
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
            <div className="pagination-wrapper">
              <Pagination
              currentPage={transPage}
              totalItems={todayTransactions.length}
              itemsPerPage={itemsPerPageTrans}
              onPageChange={(page) => setTransPage(page)}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}