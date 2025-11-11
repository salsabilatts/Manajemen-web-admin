import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Kesehatan() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detailItem, setDetailItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch Data
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${BASE_URL}/api/v1/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const healthData = res.data.filter((i) => i.Type === "Kesehatan");
        setAllData(healthData);
        setFiltered(healthData);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Normalisasi status (biar konsisten)
  const normalizeStatus = (s) => {
    const x = s?.toLowerCase();
    if (!x) return "unknown";
    if (["approved", "disetujui"].includes(x)) return "approved";
    if (["rejected", "ditolak"].includes(x)) return "rejected";
    if (["review", "pending"].includes(x)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(x)) return "validasi berkas";
    return x;
  };

  // ✅ Filter by status
  useEffect(() => {
    if (activeStatus === "all") {
      setFiltered(allData);
    } else {
      setFiltered(
        allData.filter((d) => normalizeStatus(d.Status) === activeStatus)
      );
    }
  }, [activeStatus, allData]);

  // ✅ Modal
  const openDetail = (item) => {
    setDetailItem(item);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // ✅ Download file
  const downloadFile = async (url, filename) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Gagal download file");
    }
  };

  // ✅ Update Status
  const updateStatus = async (id, status, notes) => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/admin/submissions/${id}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Status berhasil diperbarui");
      window.location.reload();
    } catch (err) {
      alert("Gagal update status");
    }
  };

  // ✅ Export Excel
  const exportExcel = () => {
    const formatted = filtered.map((item, index) => ({
      No: index + 1,
      "Tanggal": new Date(item.CreatedAt).toLocaleString("id-ID"),
      Nama: item.User?.full_name,
      "Nama Pemohon": item.FormData?.["Nama Pasien"],
      NIK: item.FormData?.["NIK"],
      "Kebutuhan Bantuan": item.FormData?.["Kebutuhan Bantuan"],
      Keluhan: item.FormData?.["Keluhan Penyakit"],
      Status: item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Kesehatan");

    XLSX.writeFile(wb, "kesehatan.xlsx");
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="container">
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
          <a href="/users" className="nav-item ">
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
          <a href="/kesehatan" className="nav-item active">
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
        {/* ✅ Top Bar */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Kesehatan</h1>
            <p className="breadcrumb">Home / Kesehatan</p>
          </div>

          <div className="top-bar-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
            </button>

            <div className="user-profile">
              <div className="user-avatar">AL</div>
              <div className="user-info">
                <span>Admin</span>
                <i className="fas fa-chevron-down" />
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        {/* ✅ Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-heartbeat"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.length}</h3>
              <p>Total Pengajuan Kesehatan</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow"><i className="fas fa-clock"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "review").length}</h3>
              <p>Dalam Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow"><i className="fas fa-clock"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "validasi berkas").length}</h3>
              <p>Validasi Berkas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-check-circle"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "approved").length}</h3>
              <p>Disetujui</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><i className="fas fa-times-circle"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "rejected").length}</h3>
              <p>Ditolak</p>
            </div>
          </div>
        </section>

        {/* ✅ Table */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar Pengajuan Kesehatan</h2>

            {/* Filter */}
            <div className="filter-buttons">
              {["all", "review", "validasi berkas", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? "active" : ""}`}
                  onClick={() => setActiveStatus(s)}
                >
                  {s === "all" ? "Semua" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="export-section">
              <button className="btn-export" onClick={exportExcel}>
                <i className="fas fa-file-excel"></i> Export
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>TANGGAL</th>
                  <th>NAMA</th>
                  <th>NAMA PEMOHON</th>
                  <th>NIK</th>
                  <th>KEBUTUHAN</th>
                  <th>KELUHAN</th>
                  <th>DOKUMEN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filtered.map((i, idx) => (
                    <tr key={i.ID}>
                      <td>{idx + 1}</td>
                      <td>{new Date(i.CreatedAt).toLocaleDateString("id-ID")}</td>
                      <td>{i.User?.full_name}</td>
                      <td>{i.FormData?.["Nama Pasien"]}</td>
                      <td>{i.FormData?.["NIK"]}</td>
                      <td>{i.FormData?.["Kebutuhan Bantuan"]}</td>
                      <td>{i.FormData?.["Keluhan Penyakit"]}</td>
                      <td>
                        {i.FormData?.document_path ? (
                          <a
                            href="#"
                            onClick={() =>
                              downloadFile(
                                `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(
                                  i.FormData.document_path.split("/").pop()
                                )}`,
                                i.FormData.document_path.split("/").pop()
                              )
                            }
                          >
                            Unduh
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${normalizeStatus(i.Status)}`}>
                          {i.Status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-detail" onClick={() => openDetail(i)}>
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

      {/* ✅ MODAL */}
      {modalOpen && detailItem && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Bantuan Kesehatan</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detailItem.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama:</strong> {detailItem.User?.full_name}</p>
              <p><strong>Email:</strong> {detailItem.User?.email}</p>
              <p><strong>Nama Pemohon:</strong> {detailItem.FormData?.["Nama Pasien"]}</p>
              <p><strong>NIK:</strong> {detailItem.FormData?.["NIK"]}</p>
              <p><strong>Kebutuhan Bantuan:</strong> {detailItem.FormData?.["Kebutuhan Bantuan"]}</p>
              <p><strong>Keluhan:</strong> {detailItem.FormData?.["Keluhan Penyakit"]}</p>
              <p><strong>Status:</strong> {detailItem.Status}</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Tutup</button>

              <button
                className="btn btn-warning"
                onClick={() =>
                  updateStatus(detailItem.ID, "validasi berkas", "Berkas divalidasi.")
                }
              >
                Validasi Berkas
              </button>

              <button
                className="btn btn-success"
                onClick={() =>
                  updateStatus(detailItem.ID, "disetujui", "Pengajuan disetujui.")
                }
              >
                Setujui
              </button>

              <button
                className="btn btn-danger"
                onClick={() =>
                  updateStatus(detailItem.ID, "ditolak", "Pengajuan ditolak.")
                }
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}