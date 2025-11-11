import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Sosial() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // FETCH DATA
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
        const sosial = (res.data || []).filter((d) => d.Type === "Sosial");
        setAllData(sosial);
        setFiltered(sosial);
      })
      .catch((err) => console.error(err));
  }, []);

  // NORMALIZE STATUS
  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    const s = status.toLowerCase();
    if (["approved", "disetujui"].includes(s)) return "approved";
    if (["review", "pending"].includes(s)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(s)) return "validasi berkas";
    if (["rejected", "ditolak"].includes(s)) return "rejected";
    return s;
  };

  // FILTER
  useEffect(() => {
    if (activeStatus === "all") setFiltered(allData);
    else setFiltered(allData.filter((d) => normalizeStatus(d.Status) === activeStatus));
  }, [activeStatus, allData]);

  const filterStatus = (s) => setActiveStatus(s);

  // MODAL
  const openDetail = (item) => {
    setDetail(item);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // DOWNLOAD FILE
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

  // UPDATE STATUS
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

  // EXPORT EXCEL
  const exportExcel = () => {
    if (!filtered.length) return alert("Tidak ada data!");

    const formatted = filtered.map((item, idx) => ({
      No: idx + 1,
      Tanggal: new Date(item.CreatedAt).toLocaleString("id-ID"),
      "Nama Pemohon": item.User?.full_name || "-",
      "Nama Acara": item.FormData?.["Nama Acara"] || "-",
      "Lokasi Acara": item.FormData?.["Lokasi Acara"] || "-",
      "Deskripsi Singkat": item.FormData?.["Deskripsi Singkat Proposal"] || "-",
      Status: item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.writeFile(wb, "sosial.xlsx");
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
          <a href="/dashboard" className="nav-item"><i className="fas fa-home"></i> Dashboard</a>
          <a href="/users" className="nav-item"><i className="fas fa-users-cog"></i> Manajemen User</a>
          <a href="/umkm" className="nav-item"><i className="fas fa-store"></i> UMKM</a>
          <a href="/pendidikan" className="nav-item"><i className="fas fa-graduation-cap"></i> Pendidikan</a>
          <a href="/kesehatan" className="nav-item"><i className="fas fa-heartbeat"></i> Kesehatan</a>
          <a href="/hukum" className="nav-item"><i className="fas fa-balance-scale"></i> Bantuan Hukum</a>
          <a href="/sosial" className="nav-item active"><i className="fas fa-hands-helping"></i> Sosial</a>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Bantuan Sosial</h1>
            <p className="breadcrumb">Home / Sosial</p>
          </div>
      <div className="top-bar-actions">
        <button className="notification-btn">
          <i className="fas fa-bell"></i></button>
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
            <div className="stat-icon green"><i className="fas fa-hands-helping"></i></div>
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
            <h2>Daftar Pengajuan Bantuan Sosial</h2>

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
                  <th>NAMA ACARA</th>
                  <th>LOKASI</th>
                  <th>DESKRIPSI</th>
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
                        <td>{item.FormData?.["Nama Acara"]}</td>
                        <td>{item.FormData?.["Lokasi Acara"]}</td>
                        <td>{item.FormData?.["Deskripsi Singkat Proposal"]}</td>
                        <td>{docCell}</td>
                        <td>
                          <span className={`status-badge ${normalizeStatus(item.Status)}`}>
                            {item.Status}
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
              <h2>Detail Bantuan Sosial</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detail.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama Pemohon:</strong> {detail.User?.full_name}</p>
              <p><strong>Email:</strong> {detail.User?.email}</p>
              <p><strong>Nama Acara:</strong> {detail.FormData?.["Nama Acara"]}</p>
              <p><strong>Lokasi Acara:</strong> {detail.FormData?.["Lokasi Acara"]}</p>
              <p><strong>Deskripsi:</strong> {detail.FormData?.["Deskripsi Singkat Proposal"]}</p>

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
                onClick={() =>
                  updateStatus(detail.ID, "validasi berkas", "Berkas telah divalidasi")
                }
              >
                Validasi Berkas
              </button>

              <button
                className="btn btn-success"
                onClick={() =>
                  updateStatus(detail.ID, "disetujui", "Pengajuan disetujui")
                }
              >
                Setujui
              </button>

              <button
                className="btn btn-danger"
                onClick={() =>
                  updateStatus(detail.ID, "ditolak", "Pengajuan ditolak")
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