import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../css/style.css";
import Pagination from "../components/Pagination.jsx";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Pendidikan() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const token = localStorage.getItem("token");

  // ✅ FETCH DATA
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${BASE_URL}/api/v1/admin/submissions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const pendidikan = res.data.filter((d) => d.Type === "Pendidikan");
        setAllData(pendidikan);
        setFiltered(pendidikan);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ NORMALIZE STATUS
  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    const s = status.toLowerCase();
    if (["approved", "disetujui"].includes(s)) return "approved";
    if (["review", "pending"].includes(s)) return "review";
    if (["validasi berkas", "diverifikasi"].includes(s))
      return "validasi berkas";
    if (["rejected", "ditolak"].includes(s)) return "rejected";
    return s;
  };

  // ✅ FILTER STATUS (reactive)
  useEffect(() => {
    if (activeStatus === "all") {
      setFiltered(allData);
    } else {
      setFiltered(
        allData.filter((d) => normalizeStatus(d.Status) === activeStatus)
      );
    }
  }, [activeStatus, allData]);

  // ✅ MODAL DETAIL
  const openDetail = (item) => {
    setDetail(item);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ✅ DOWNLOAD FILE
  const downloadFile = async (url, filename) => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal unduh file");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (filename.endsWith(".pdf")) {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
      }

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Gagal mengunduh file");
    }
  };

  // ✅ UPDATE STATUS
  const updateStatus = async (id, status, notes) => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/admin/submissions/${id}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Status berhasil diubah menjadi ${status}`);
      window.location.reload();
    } catch (err) {
      alert("Gagal mengubah status");
    }
  };

  // ✅ EXPORT EXCEL
  const exportExcel = () => {
    if (filtered.length === 0) return alert("Tidak ada data");

    const formatted = filtered.map((item, index) => ({
      No: index + 1,
      Tanggal: new Date(item.CreatedAt).toLocaleString("id-ID"),
      Nama: item.User?.full_name || "-",
      Email: item.User?.email || "-",
      "Nama Siswa/Mahasiswa": item.FormData?.["Nama Siswa/Mahasiswa"] || "-",
      "NISN/NIM": item.FormData?.["NISN/NIM"] || "-",
      "Sekolah/Universitas": item.FormData?.["Nama Sekolah/Kampus"] || "-",
      "Jenis Bantuan": item.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"] || "-",
      Status: item.Status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formatted);
    XLSX.utils.book_append_sheet(wb, ws, "Pendidikan");

    XLSX.writeFile(wb, "pendidikan.xlsx");
  };

  const logout = () => {
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

      {/* MAIN */}
      <main className="main-content">
        <header className="top-bar">
          <div className="greeting">
            <h1>Pendidikan</h1>
            <p className="breadcrumb">Home / Pendidikan</p>
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

            <button className="logout-btn" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        {/* ✅ STAT CARDS */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.length}</h3>
              <p>Total Pengajuan</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "review").length}</h3>
              <p>Dalam Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <i className="fas fa-folder"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "validasi berkas").length}</h3>
              <p>Validasi Berkas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "approved").length}</h3>
              <p>Disetujui</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{allData.filter((d) => normalizeStatus(d.Status) === "rejected").length}</h3>
              <p>Ditolak</p>
            </div>
          </div>
        </section>

        {/* ✅ TABLE */}
        <section className="activity-section">
          <div className="section-header">
            <h2>Daftar Pengajuan Pendidikan</h2>

            <div className="filter-buttons">
              {["all", "review", "validasi berkas", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? "active" : ""}`}
                  onClick={() => setActiveStatus(s)}
                >
                  {s === "all"
                    ? "Semua"
                    : s === "review"
                    ? "Review"
                    : s === "approved"
                    ? "Disetujui"
                    : s === "rejected"
                    ? "Ditolak"
                    : "Validasi Berkas"}
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
                  <th>SISWA/MAHASISWA</th>
                  <th>NISN/NIM</th>
                  <th>SEKOLAH/UNIV</th>
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
                  currentItems.map((item, i) => {
                    const doc = item.FormData?.document_path;
                    let docName = "-";

                    if (doc) {
                      const filename = doc.split("/").pop();
                      const fileUrl = `${BASE_URL}/api/v1/admin/files/${encodeURIComponent(filename)}`;
                      docName = (
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
                        <td>{item.FormData?.["Nama Siswa/Mahasiswa"]}</td>
                        <td>{item.FormData?.["NISN/NIM"]}</td>
                        <td>{item.FormData?.["Nama Sekolah/Kampus"]}</td>
                        <td>{item.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"]}</td>
                        <td>{docName}</td>
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
            <div className="pagination-wrapper">
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
        </section>
      </main>

      {/* ✅ MODAL */}
      {modalOpen && detail && (
        <div className="modal show">
          <div className="modal-content">

            <div className="modal-header">
              <h2>Detail Bantuan Pendidikan</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Tanggal:</strong> {new Date(detail.CreatedAt).toLocaleString("id-ID")}</p>
              <p><strong>Nama:</strong> {detail.User?.full_name}</p>
              <p><strong>Email:</strong> {detail.User?.email}</p>
              <p><strong>Siswa/Mahasiswa:</strong> {detail.FormData?.["Nama Siswa/Mahasiswa"]}</p>
              <p><strong>NISN/NIM:</strong> {detail.FormData?.["NISN/NIM"]}</p>
              <p><strong>Sekolah/Kampus:</strong> {detail.FormData?.["Nama Sekolah/Kampus"]}</p>
              <p><strong>Jenis Bantuan:</strong> {detail.FormData?.["Jenis Bantuan (PIP/KIP/Lainnya)"]}</p>

              {/* Dokumen */}
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