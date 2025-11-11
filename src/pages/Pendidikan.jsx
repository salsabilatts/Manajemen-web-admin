import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Pendidikan() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detailData, setDetailData] = useState(null);

  const token = localStorage.getItem("token");

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
        const filtered = data.filter((i) => i.Type === "Pendidikan");
        setAllData(filtered);
        setFiltered(filtered);
      })
      .catch((err) => console.error(err));
  }, []);

  const normalize = (status) => {
    const s = status?.toLowerCase();
    if (!s) return "unknown";
    if (["approved", "disetujui"].includes(s)) return "approved";
    if (["review", "pending"].includes(s)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(s)) return "validasi berkas";
    if (["rejected", "ditolak"].includes(s)) return "rejected";
    return s;
  };

  const filterStatus = (status) => {
    setActiveStatus(status);
    if (status === "all") setFiltered(allData);
    else setFiltered(allData.filter((d) => normalize(d.Status) === status));
  };

  const openDetail = (item) => setDetailData(item);
  const closeDetail = () => setDetailData(null);

  const exportExcel = () => {
    if (!filtered.length) return alert("Tidak ada data!");

    const formatted = filtered.map((item, idx) => ({
      No: idx + 1,
      "Tanggal": new Date(item.CreatedAt).toLocaleString("id-ID"),
      "Nama": item.User?.full_name || "-",
      "Nama Siswa/Mahasiswa": item.FormData?.["Nama Siswa/Mahasiswa"] || "-",
      "NISN/NIM": item.FormData?.["NISN/NIM"] || "-",
      "Sekolah/Universitas": item.FormData?.["Nama Sekolah/Kampus"] || "-",
      "Jenis Bantuan": item.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"] || "-",
      "Status": item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Pendidikan");
    XLSX.writeFile(wb, "pendidikan.xlsx");
  };

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
          <a href="/users" className="nav-item">
            <i className="fas fa-users-cog"></i>
            <span>Manajemen User</span>
          </a>
          <a href="/umkm" className="nav-item">
            <i className="fas fa-store"></i>
            <span>UMKM</span>
          </a>
          <a href="/pendidikan" className="nav-item active">
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
            <h1>Pendidikan</h1>
            <p className="breadcrumb">Home / Pendidikan</p>
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

        {/* ====================== STATS ====================== */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-graduation-cap"></i></div>
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

        {/* ====================== TABLE ====================== */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar Pengajuan Pendidikan</h2>

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
                  <th>NAMA</th>
                  <th>NAMA SISWA/MAHASISWA</th>
                  <th>NISN/NIM</th>
                  <th>SEKOLAH/UNIVERSITAS</th>
                  <th>JENIS BANTUAN</th>
                  <th>DOKUMEN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="10" className="no-data">Tidak ada data</td></tr>
                ) : (
                  filtered.map((item, i) => (
                    <tr key={item.ID}>
                      <td>{i + 1}</td>
                      <td>{new Date(item.CreatedAt).toLocaleDateString("id-ID")}</td>
                      <td>{item.User?.full_name}</td>
                      <td>{item.FormData?.["Nama Siswa/Mahasiswa"]}</td>
                      <td>{item.FormData?.["NISN/NIM"]}</td>
                      <td>{item.FormData?.["Nama Sekolah/Kampus"]}</td>
                      <td>{item.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"]}</td>

                      <td>
                        {item.FormData?.document_path ? (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(
                                `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(
                                  item.FormData.document_path.split("/").pop()
                                )}`,
                                "_blank"
                              );
                            }}
                          >
                            Unduh
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <span className={`status-badge ${normalize(item.Status)}`}>
                          {item.Status}
                        </span>
                      </td>

                      <td>
                        <button className="btn-detail" onClick={() => openDetail(item)}>
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

      {/* ====================== MODAL ====================== */}
      {detailData && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Bantuan Pendidikan</h2>
              <button className="modal-close" onClick={closeDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detailData.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama:</strong> {detailData.User?.full_name}</p>
              <p><strong>Email:</strong> {detailData.User?.email}</p>
              <p><strong>Nama Siswa/Mahasiswa:</strong> {detailData.FormData?.["Nama Siswa/Mahasiswa"]}</p>
              <p><strong>NISN/NIM:</strong> {detailData.FormData?.["NISN/NIM"]}</p>
              <p><strong>Sekolah/Universitas:</strong> {detailData.FormData?.["Nama Sekolah/Kampus"]}</p>
              <p><strong>Jenis Bantuan:</strong> {detailData.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"]}</p>

              {detailData.FormData?.document_path && (
                <p>
                  <strong>Dokumen:</strong>{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(
                          detailData.FormData.document_path.split("/").pop()
                        )}`,
                        "_blank"
                      );
                    }}
                  >
                    Unduh Dokumen
                  </a>
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetail}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}