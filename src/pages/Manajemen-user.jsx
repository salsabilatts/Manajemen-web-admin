import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function ManajemenUser() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeRole, setActiveRole] = useState("all");
  const [search, setSearch] = useState("");
  const [detailUser, setDetailUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch Data
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAllUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // ✅ Filter by Role + Search
  useEffect(() => {
    let data = [...allUsers];

    if (activeRole !== "all") {
      data = data.filter(
        (u) => u.role?.toLowerCase() === activeRole.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      const key = search.toLowerCase();

      data = data.filter((u) => {
        return (
          u.full_name?.toLowerCase().includes(key) ||
          u.email?.toLowerCase().includes(key) ||
          u.card_uid?.toLowerCase().includes(key) ||
          u.phone?.toLowerCase().includes(key) ||
          u.provinsi?.toLowerCase().includes(key) ||
          u.kabupaten?.toLowerCase().includes(key) ||
          u.kecamatan?.toLowerCase().includes(key) ||
          u.kelurahan?.toLowerCase().includes(key)
        );
      });
    }

    setFilteredUsers(data);
  }, [activeRole, search, allUsers]);

  // ✅ Modal Detail
  const handleDetail = (user) => {
    setDetailUser(user);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ✅ Export Excel
  const exportExcel = () => {
    if (filteredUsers.length === 0) {
      alert("Tidak ada data.");
      return;
    }

    const formatted = filteredUsers.map((u, index) => ({
      No: index + 1,
      "ID User": u.ID,
      "Card ID": u.card_uid,
      "Nama Lengkap": u.full_name,
      Email: u.email,
      Telepon: u.phone,
      Role: u.role,
      Provinsi: u.provinsi,
      Kabupaten: u.kabupaten,
      Kecamatan: u.kecamatan,
      Kelurahan: u.kelurahan,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Manajemen User");

    XLSX.writeFile(wb, "manajemen_user.xlsx");
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
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
          <a href="/dashboard" className="nav-item">
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a href="/users" className="nav-item active">
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
      <main className="main-content">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Manajemen User</h1>
            <p className="breadcrumb">Home / Manajemen User</p>
          </div>

          <div className="top-bar-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
            </button>

            <div className="user-profile">
              <div className="user-avatar">AL</div>
              <div className="user-info">
                <span>Admin</span>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        {/* 🔵 Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{allUsers.length}</h3>
              <p>Total User</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="stat-content">
              <h3>{allUsers.filter((u) => u.role === "admin").length}</h3>
              <p>Admin</p>
            </div>
          </div>
        </section>

        {/* ==========================
            ✅ USER TABLE SECTION
        =========================== */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar User</h2>

            {/* Filter Role */}
            <div className="filter-buttons">
              {["all", "admin", "user"].map((r) => (
                <button
                  key={r}
                  className={`filter-btn ${activeRole === r ? "active" : ""}`}
                  onClick={() => setActiveRole(r)}
                >
                  {r === "all"
                    ? "Semua"
                    : r === "admin"
                    ? "Admin"
                    : "User"}
                </button>
              ))}
            </div>

            {/* ✅ Search */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Cari nama, email, card ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>

            <div className="export-section">
              <button className="btn-export" onClick={exportExcel}>
                <i className="fas fa-file-excel"></i> Export
              </button>
            </div>
          </div>

          {/* ✅ Table */}
          <div className="table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>CARD ID</th>
                  <th>NAMA</th>
                  <th>EMAIL</th>
                  <th>TELEPON</th>
                  <th>ROLE</th>
                  <th>PROVINSI</th>
                  <th>KABUPATEN</th>
                  <th>KECAMATAN</th>
                  <th>KELURAHAN</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-data">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr key={u.ID}>
                      <td>{i + 1}</td>
                      <td>{u.card_uid || "-"}</td>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`status-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.provinsi}</td>
                      <td>{u.kabupaten}</td>
                      <td>{u.kecamatan}</td>
                      <td>{u.kelurahan}</td>
                      <td>
                        <button
                          className="btn-detail"
                          onClick={() => handleDetail(u)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ✅ MODAL DETAIL */}
      {modalOpen && detailUser && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail User</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              <p><strong>ID User:</strong> {detailUser.ID}</p>
              <p><strong>Card ID:</strong> {detailUser.card_uid}</p>
              <p><strong>Nama:</strong> {detailUser.full_name}</p>
              <p><strong>Email:</strong> {detailUser.email}</p>
              <p><strong>Telepon:</strong> {detailUser.phone}</p>
              <p><strong>Role:</strong> {detailUser.role}</p>
              <p><strong>Provinsi:</strong> {detailUser.provinsi}</p>
              <p><strong>Kabupaten:</strong> {detailUser.kabupaten}</p>
              <p><strong>Kecamatan:</strong> {detailUser.kecamatan}</p>
              <p><strong>Kelurahan:</strong> {detailUser.kelurahan}</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}