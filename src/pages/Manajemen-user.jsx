import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";
import Pagination from "../components/Pagination.jsx";
import Sidebar from "../components/Sidebar.jsx";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function ManajemenUser() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeRole, setActiveRole] = useState("all");
  const [search, setSearch] = useState("");

// State untuk 2 modal yang berbeda
  const [detailUser, setDetailUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // State untuk form di dalam modal edit
  const [editRole, setEditRole] = useState("");
  const [editWilayah, setEditWilayah] = useState("");
  
  // State untuk role admin saat ini
  const [currentAdminRole, setCurrentAdminRole] = useState("");

  const token = localStorage.getItem("token");

  const wilayahOptions = [
    "KAB. TANGERANG",
    "KOTA TANGERANG",
    "KOTA TANGERANG SELATAN",
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // ✅ Fetch Data
// ✅ Fetch Data & Cek Role Admin
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Ambil role admin saat ini dari localStorage
    const role = localStorage.getItem("user_role");
    setCurrentAdminRole(role);

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
  }, [token]);

  // ✅ Filter by Role + Search
// ✅ Filter by Role + Search (improved)
useEffect(() => {
  setCurrentPage(1); // Reset to first page on filter change
  let data = Array.isArray(allUsers) ? [...allUsers] : [];

  // Normalisasi activeRole untuk perbandingan
  const roleFilter = (activeRole || "").toString().trim().toLowerCase();

  if (roleFilter !== "all" && roleFilter !== "") {
    data = data.filter((u) => {
      const r = (u?.role || "").toString().toLowerCase();

      // Jika dropdown memilih "admin", kita anggap semua tipe admin valid
      if (roleFilter === "admin") {
        return ["admin", "admin_wilayah", "super_admin"].includes(r);
      }

      // otherwise match exact role
      return r === roleFilter;
    });
  }

  const q = (search || "").toString().trim().toLowerCase();
  if (q !== "") {
    data = data.filter((u) => {
      // convert all checked fields to string safely then lowercase
      const fullName = (u?.full_name || "").toString().toLowerCase();
      const email = (u?.email || "").toString().toLowerCase();
      const card = (u?.card_uid || "").toString().toLowerCase();
      const phone = (u?.phone || "").toString().toLowerCase();
      const prov = (u?.provinsi || "").toString().toLowerCase();
      const kab = (u?.kabupaten || "").toString().toLowerCase();
      const kec = (u?.kecamatan || "").toString().toLowerCase();
      const kel = (u?.kelurahan || "").toString().toLowerCase();
      const wilayah = (u?.wilayah_tugas || "").toString().toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        card.includes(q) ||
        phone.includes(q) ||
        prov.includes(q) ||
        kab.includes(q) ||
        kec.includes(q) ||
        kel.includes(q) ||
        wilayah.includes(q) // <-- added wilayah_tugas
      );
    });
  }

  setFilteredUsers(data);
}, [activeRole, search, allUsers]);


  // ✅ Modal Detail
  const handleDetail = (user) => {
    setDetailUser(user);
    setDetailModalOpen(true);
  };

  const closeModal = () => setDetailModalOpen(false);

  // --- FUNGSI BARU UNTUK MODAL EDIT ---
  const handleEdit = (user) => {
    setEditUser(user);
    setEditRole(user.role); // Set state awal dropdown role
    setEditWilayah(user.wilayah_tugas || ""); // Set state awal dropdown wilayah
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    // Siapkan payload untuk API
    const payload = {
      role: editRole,
      // Hanya kirim wilayah_tugas jika rolenya 'admin_wilayah'
      wilayah_tugas: editRole === 'admin_wilayah' ? editWilayah : "",
      // Kirim field lain agar Updates() di GORM bisa bekerja (opsional)
      full_name: editUser.full_name,
      email: editUser.email,
      phone: editUser.phone
    };
    
    try {
      // Panggil API PUT
      await axios.put(`${BASE_URL}/api/v1/admin/users/${editUser.ID}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Jika sukses, fetch ulang data untuk refresh tabel
      const res = await axios.get(`${BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data);
      closeEditModal(); // Tutup modal

    } catch (err) {
      console.error("Gagal update user:", err);
      alert("Gagal menyimpan perubahan. Cek console.");
    }
  };
  // ------------------------------------

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
      <Sidebar />

      {/* Main Content */}
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
    <div className="stat-icon blue"><i className="fas fa-users"></i></div>
    <div className="stat-content">
      <h3>{allUsers.length}</h3>
      <p>Total User</p>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon green"><i className="fas fa-user-shield"></i></div>
    <div className="stat-content">
      <h3>{
        allUsers.filter(u => {
          const r = (u.role || "").toLowerCase();
          return r === "admin" || r === "admin_wilayah" || r === "super_admin";
        }).length
      }</h3>
      <p>Admin (semua tipe)</p>
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
                  <th>WILAYAH TUGAS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

<tbody>
  {filteredUsers.length === 0 ? (
    <tr>
      <td colSpan="12" className="no-data">
        Tidak ada data
      </td>
    </tr>
  ) : (
    currentItems.map((u, i) => (
      <tr key={u.ID || u.id || i}>
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

        {/* => Pastikan urutan kolom sama seperti header */}
        <td>{u.provinsi || "-"}</td>
        <td>{u.kabupaten || "-"}</td>
        <td>{u.kecamatan || "-"}</td>
        <td>{u.kelurahan || "-"}</td>
        <td>{u.wilayah_tugas || "-"}</td>

        <td>
          <button className="btn-detail" onClick={() => handleDetail(u)}>Detail</button>
          { (currentAdminRole === 'super_admin') && (
            <button
              className="action-btn edit"
              onClick={() => handleEdit(u)}
              style={{ marginLeft: "5px" }}
            >
              Edit
            </button>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>

            </table>
          </div>
          <div className="pagination-wrapper">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredUsers.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                    </div>
        </section>
      </main>

      {/* ✅ MODAL DETAIL */}
      {detailModalOpen && detailUser && (
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
              <p><strong>Wilayah Tugas:</strong> {detailUser.wilayah_tugas || "-"}</p>
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
      {/* --- MODAL BARU UNTUK EDIT --- */}
      {editModalOpen && editUser && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User: {editUser.full_name}</h2>
              <button className="modal-close" onClick={closeEditModal}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              {/* Form Edit */}
              <div className="form-group">
                <label>Email (Tidak bisa diubah)</label>
                <input type="email" value={editUser.email} disabled />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select 
                  className="filter-dropdown" 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin_wilayah">admin_wilayah</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>

              {/* Tampilkan dropdown wilayah HANYA jika rolenya admin_wilayah */}
              {editRole === 'admin_wilayah' && (
                <div className="form-group">
                  <label>Wilayah Tugas</label>
                  <select 
                    className="filter-dropdown"
                    value={editWilayah}
                    onChange={(e) => setEditWilayah(e.target.value)}
                  >
                    <option value="">Pilih Wilayah</option>
                    {wilayahOptions.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>
                Batal
              </button>
              <button className="btn btn-success" onClick={handleSaveEdit}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ----------------------------- */}
    </div>
  );
}