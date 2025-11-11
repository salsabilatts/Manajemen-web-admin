import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Sosial() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detailData, setDetailData] = useState(null);
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
        const data = res.data || [];
        const list = data.filter((i) => i.Type === "Sosial");
        setAllData(list);
        setFiltered(list);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Normalize Status
  const normalize = (status) => {
    const s = status?.toLowerCase();
    if (!s) return "unknown";
    if (["approved", "disetujui"].includes(s)) return "approved";
    if (["review", "pending"].includes(s)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(s)) return "validasi berkas";
    if (["rejected", "ditolak"].includes(s)) return "rejected";
    return s;
  };

  // ✅ Filter berdasarkan status
  const changeStatus = (status) => {
    setActiveStatus(status);
    if (status === "all") setFiltered(allData);
    else setFiltered(allData.filter((d) => normalize(d.Status) === status));
  };

  // ✅ Download dokumen
  const downloadFile = async (path) => {
    try {
      const filename = path.split("/").pop();
      const url = `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(
        filename
      )}`;

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
      alert("Gagal mengunduh dokumen");
    }
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (!filtered.length) return alert("Tidak ada data!");

    const formatted = filtered.map((item, i) => ({
      No: i + 1,
      "Tanggal": new Date(item.CreatedAt).toLocaleString("id-ID"),
      "Nama Pemohon": item.User?.full_name || "-",
      "Nama Acara": item.FormData?.["Nama Acara"] || "-",
      "Lokasi Acara": item.FormData?.["Lokasi Acara"] || "-",
      "Deskripsi Singkat": item.FormData?.["Deskripsi Singkat Proposal"] || "-",
      Status: item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Sosial");

    XLSX.writeFile(wb, "sosial.xlsx");
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

      {/* MAIN */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="greeting">
            <h1>Bantuan Sosial</h1>
            <p className="breadcrumb">Home / Sosial</p>
          </div>

          <div className="top-bar-actions">
            <button className="notification-btn"><i className="fas fa-bell"></i></button>

            <div className="user-profile">
              <div className="user-avatar">AL</div>
              <div className="user-info"><span>Admin</span></div>
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        {/* ✅ STATS SECTION (5 KOTAK – sama persis format Pendidikan) */}
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
              <h3>{allData.filter((d) => normalize(d.Status) === "review").length}</h3>
              <p>Dalam Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow"><i className="fas fa-clock"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalize(d.Status) === "validasi berkas").length}</h3>
              <p>Validasi Berkas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-check-circle"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalize(d.Status) === "approved").length}</h3>
              <p>Disetujui</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><i className="fas fa-times-circle"></i></div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalize(d.Status) === "rejected").length}</h3>
              <p>Ditolak</p>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar Pengajuan Bantuan Sosial</h2>

            {/* FILTER */}
            <div className="filter-buttons">
              {["all", "review", "validasi berkas", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? "active" : ""}`}
                  onClick={() => changeStatus(s)}
                >
                  {s === "all"
                    ? "Semua"
                    : s === "review"
                    ? "Review"
                    : s === "validasi berkas"
                    ? "Validasi Berkas"
                    : s === "approved"
                    ? "Disetujui"
                    : "Ditolak"}
                </button>
              ))}
            </div>

            {/* EXPORT */}
            <div className="export-section">
              <button className="btn-export" onClick={exportExcel}>
                <i className="fas fa-file-excel"></i> Export
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>TANGGAL</th>
                  <th>NAMA PEMOHON</th>
                  <th>NAMA ACARA</th>
                  <th>LOKASI ACARA</th>
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
                  filtered.map((d, i) => (
                    <tr key={d.ID}>
                      <td>{i + 1}</td>
                      <td>{new Date(d.CreatedAt).toLocaleDateString("id-ID")}</td>
                      <td>{d.User?.full_name}</td>
                      <td>{d.FormData?.["Nama Acara"]}</td>
                      <td>{d.FormData?.["Lokasi Acara"]}</td>
                      <td>{d.FormData?.["Deskripsi Singkat Proposal"]}</td>

                      <td>
                        {d.FormData?.document_path ? (
                          <button
                            className="btn-detail"
                            onClick={() => downloadFile(d.FormData.document_path)}
                          >
                            Unduh
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <span className={`status-badge ${normalize(d.Status)}`}>
                          {d.Status}
                        </span>
                      </td>

                      <td>
                        <button className="btn-detail" onClick={() => setDetailData(d)}>
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

      {/* MODAL */}
      {detailData && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Bantuan Sosial</h2>
              <button className="modal-close" onClick={() => setDetailData(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detailData.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama Pemohon:</strong> {detailData.User?.full_name}</p>
              <p><strong>Email:</strong> {detailData.User?.email}</p>
              <p><strong>Nama Acara:</strong> {detailData.FormData?.["Nama Acara"]}</p>
              <p><strong>Lokasi Acara:</strong> {detailData.FormData?.["Lokasi Acara"]}</p>
              <p><strong>Deskripsi:</strong> {detailData.FormData?.["Deskripsi Singkat Proposal"]}</p>

              {detailData.FormData?.document_path && (
                <p>
                  <strong>Dokumen:</strong>{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadFile(detailData.FormData.document_path);
                    }}
                  >
                    Unduh Dokumen
                  </a>
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailData(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}