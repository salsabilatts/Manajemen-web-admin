import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function BantuanHukum() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch data
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${BASE_URL}/api/v1/admin/submissions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const hukum = (res.data || []).filter((d) => d.Type === "Hukum");
        setAllData(hukum);
        setFiltered(hukum);
      })
      .catch((err) => console.error(err));
  }, []);

  // Normalize status
  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    const s = status.toLowerCase();
    if (["approved", "disetujui"].includes(s)) return "approved";
    if (["review", "pending"].includes(s)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(s)) return "validasi berkas";
    if (["rejected", "ditolak"].includes(s)) return "rejected";
    return s;
  };

  // FILTER (reactive)
  useEffect(() => {
    if (activeStatus === "all") setFiltered(allData);
    else setFiltered(allData.filter((d) => normalizeStatus(d.Status) === activeStatus));
  }, [activeStatus, allData]);

  // ✅ tambahkan fungsi kecil biar onClick gak error
  const filterStatus = (s) => setActiveStatus(s);

  // Modal
  const openDetail = (item) => {
    setDetail(item);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Download file (url + filename wajib ada)
  const downloadFile = async (url, filename) => {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Gagal unduh file");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (filename.toLowerCase().endsWith(".pdf")) {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
      }
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Gagal mengunduh file");
    }
  };

  // Update status
  const updateStatus = async (id, status, notes) => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/admin/submissions/${id}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Status berhasil diubah menjadi ${status}`);
      window.location.reload();
    } catch {
      alert("Gagal mengubah status");
    }
  };

  // Export Excel
  const exportExcel = () => {
    if (!filtered.length) return alert("Tidak ada data!");

    const formatted = filtered.map((item, idx) => ({
      No: idx + 1,
      Tanggal: new Date(item.CreatedAt).toLocaleString("id-ID"),
      "Nama Pemohon": item.User?.full_name || "-",
      Email: item.User?.email || "-",
      "Kebutuhan Bantuan": item.FormData?.["Kebutuhan Bantuan"] || "-",
      "Pihak Terkait": item.FormData?.["Pihak Terkait"] || "-",
      "Uraian Masalah": item.FormData?.["Uraian Singkat Masalah"] || "-",
      Status: item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Bantuan Hukum");
    XLSX.writeFile(wb, "bantuan_hukum.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="container">
      {/* SIDEBAR */}
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
          <a href="/hukum" className="nav-item active">
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
            <h1>Bantuan Hukum</h1>
            <p className="breadcrumb">Home / Hukum</p>
          </div>

          <div className="top-bar-actions">
            <button className="notification-btn"><i className="fas fa-bell"></i></button>
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

        {/* STATS */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-balance-scale"></i></div>
            <div className="stat-content">
              <h3>{allData.length}</h3>
              <p>Total Pengajuan</p>
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

        {/* TABLE */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar Pengajuan Bantuan Hukum</h2>

            <div className="filter-buttons">
              {["all", "review", "validasi berkas", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? "active" : ""}`}
                  onClick={() => filterStatus(s)}
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
                  <th>NAMA PEMOHON</th>
                  <th>KEBUTUHAN</th>
                  <th>PIHAK TERKAIT</th>
                  <th>URAIAN</th>
                  <th>DOKUMEN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="9" className="no-data">Tidak ada data</td></tr>
                ) : (
                  filtered.map((item, i) => {
                    const doc = item.FormData?.document_path;
                    let docCell = "-";
                    if (doc) {
                      const filename = doc.split("/").pop();
                      const fileUrl = `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(filename)}`;
                      docCell = (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            downloadFile(fileUrl, filename);
                          }}
                        >
                          Unduh
                        </a>
                      );
                    }

                    return (
                      <tr key={item.ID}>
                        <td>{i + 1}</td>
                        <td>{new Date(item.CreatedAt).toLocaleDateString("id-ID")}</td>
                        <td>{item.User?.full_name}</td>
                        <td>{item.FormData?.["Kebutuhan Bantuan"]}</td>
                        <td>{item.FormData?.["Pihak Terkait"]}</td>
                        <td>{item.FormData?.["Uraian Singkat Masalah"]}</td>
                        <td>{docCell}</td>
                        <td>
                          <span className={`status-badge ${normalizeStatus(item.Status)}`}>
                            {item.Status}`
                          </span>
                        </td>
                        <td>
                          <button className="btn-detail" onClick={() => openDetail(item)}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL */}
      {modalOpen && detail && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Bantuan Hukum</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* pastikan semua isi tetap DI DALAM modal-body */}
            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detail.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama:</strong> {detail.User?.full_name}</p>
              <p><strong>Email:</strong> {detail.User?.email}</p>
              <p><strong>Kebutuhan:</strong> {detail.FormData?.["Kebutuhan Bantuan"]}</p>
              <p><strong>Pihak Terkait:</strong> {detail.FormData?.["Pihak Terkait"]}</p>
              <p><strong>Uraian Masalah:</strong> {detail.FormData?.["Uraian Singkat Masalah"]}</p>

              {detail.FormData?.document_path ? (
                <p>
                  <strong>Dokumen:</strong>{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const filename = detail.FormData.document_path.split("/").pop();
                      const fileUrl = `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(filename)}`;
                      downloadFile(fileUrl, filename);
                    }}
                  >
                    Unduh Dokumen
                  </a>
                </p>
              ) : (
                <p><strong>Dokumen:</strong> -</p>
              )}

              <p><strong>Status Saat Ini:</strong> {detail.Status}</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Tutup</button>
              <button
                className="btn btn-warning"
                onClick={() => updateStatus(detail.ID, "validasi berkas", "Berkas telah divalidasi")}
              >
                Validasi Berkas
              </button>
              <button
                className="btn btn-success"
                onClick={() => updateStatus(detail.ID, "disetujui", "Pengajuan disetujui")}
              >
                Setujui
              </button>
              <button
                className="btn btn-danger"
                onClick={() => updateStatus(detail.ID, "ditolak", "Pengajuan ditolak")}
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