// src/pages/SubmissionForm.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import hooks
import axios from "axios";
import "../css/user-dashboard.css"; // Kita pakai CSS user dashboard
import "../css/submission-form.css"; // Kita buat CSS baru untuk form

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- KONFIGURASI FORM ---
// Di sinilah kita mendefinisikan field untuk setiap jenis form
const formConfig = {
  umkm: {
    title: "Formulir Bantuan UMKM",
    description: "Silakan isi detail usaha dan kebutuhan Anda.",
    type: "UMKM",
    fields: [
      { name: "Nama Usaha", label: "Nama Usaha", type: "text" },
      { name: "Jenis Usaha", label: "Jenis Usaha (Kuliner, Fashion, dll)", type: "text" },
      { name: "Alamat Usaha", label: "Alamat Usaha", type: "textarea" },
      { name: "Uraian Kebutuhan Bantuan", label: "Uraian Kebutuhan Bantuan", type: "textarea" },
    ],
  },
  pendidikan: {
    title: "Formulir Bantuan Pendidikan",
    description: "Isi detail siswa/mahasiswa dan jenis bantuan.",
    type: "Pendidikan",
    fields: [
      { name: "Nama Siswa/Mahasiswa", label: "Nama Siswa/Mahasiswa", type: "text" },
      { name: "NISN/NIM", label: "NISN/NIM", type: "text" },
      { name: "Nama Sekolah/Kampus", label: "Nama Sekolah/Kampus", type: "text" },
      { name: "Jenis Bantuan (PIP/KIP/Lainnya)", label: "Jenis Bantuan (PIP/KIP/Lainnya)", type: "text" },
    ],
  },
  kesehatan: {
    title: "Formulir Bantuan Kesehatan",
    description: "Isi detail pasien dan kebutuhan bantuan kesehatan.",
    type: "Kesehatan",
    fields: [
        { name: "Nama Pasien", label: "Nama Pasien", type: "text" },
        { name: "NIK", label: "NIK", type: "number" },
        { name: "Keluhan Penyakit", label: "Keluhan Penyakit", type: "textarea" },
        { name: "Kebutuhan Bantuan (Biaya/Ambulance)", label: "Kebutuhan Bantuan (Biaya/Ambulance)", type: "text" },
    ],
  },
  hukum: {
    title: "Formulir Bantuan Hukum",
    description: "Jelaskan permasalahan hukum yang Anda hadapi.",
    type: "Hukum",
    fields: [
        { name: "Uraian Singkat Masalah", label: "Uraian Singkat Masalah", type: "textarea" },
        { name: "Pihak Terkait", label: "Pihak Terkait (Jika Ada)", type: "text" },
        { name: "Kebutuhan Bantuan", label: "Kebutuhan Bantuan", type: "text" },
    ],
  },
  sosial: {
    title: "Formulir Bantuan Sosial",
    description: "Isi detail acara keagamaan atau sosial yang akan diadakan.",
    type: "Sosial",
    fields: [
        { name: "Nama Acara", label: "Nama Acara/Kegiatan", type: "text" },
        { name: "Tanggal Pelaksanaan", label: "Tanggal Pelaksanaan", type: "date" },
        { name: "Lokasi Acara", label: "Lokasi Acara", type: "textarea" },
        { name: "Deskripsi Singkat Proposal", label: "Deskripsi Singkat Proposal", type: "textarea" },
    ],
  },
};
// -----------------------


export default function SubmissionForm() {
  const { type } = useParams(); // Ambil 'type' dari URL (misal: "umkm")
  const config = formConfig[type]; // Ambil konfigurasi form yang sesuai
  const navigate = useNavigate(); // Untuk pindah halaman
  const token = localStorage.getItem("token");

  // --- TAMBAHKAN PENJAGA PINTU INI ---
  useEffect(() => {
    if (!token) {
      alert("Anda harus login untuk mengakses halaman ini.");
      navigate('/login');
    }
  }, [token, navigate]);
  // ---------------------------------

  // State untuk menyimpan semua nilai form
  const [formData, setFormData] = useState({});
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler untuk mengubah state form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. Buat objek FormData untuk dikirim
    const data = new FormData();
    data.append('type', config.type); // 'UMKM', 'Pendidikan', dll.
    
    // 2. Ubah state formData (objek) menjadi string JSON
    data.append('form_data', JSON.stringify(formData));
    
    // 3. Tambahkan file jika ada
    if (document) {
      data.append('document', document);
    }

    try {
      // 4. Panggil API (kita tidak pakai fetchWithAuth karena header-nya beda)
      const response = await axios.post(
        `${BASE_URL}/api/v1/submissions/`, // API Backend Go
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Penting untuk upload file
            'Accept': 'application/json',
          },
        }
      );

      // 5. Handle sukses
      setIsLoading(false);
      alert(response.data.message || 'Pengajuan berhasil dikirim!');
      navigate('/user-dashboard'); // Kembali ke dasbor
    
    } catch (err) {
      // 6. Handle error
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || "Gagal mengirim pengajuan. Coba lagi.";
      setError(errorMessage);
      console.error("Gagal submit:", err);
    }
  };

  // Jika tipe URL tidak dikenal
  if (!config) {
    return (
      <div className="user-dashboard-page">
        <div className="container user-content-area">
          <h2>Layanan Tidak Ditemukan</h2>
          <p>Tipe pengajuan yang Anda minta tidak valid.</p>
          <Link to="/user-dashboard">Kembali ke Dasbor</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-page">
      {/* Kita bisa tambahkan Navbar di sini nanti */}
      
      <div className="container user-content-area">
        <main className="form-container"> {/* Pakai style form dari CSS */}
          {/* Tombol Kembali */}
          <Link to="/user-dashboard" className="link-back">
            <i className="fas fa-arrow-left"></i> Kembali ke Layanan
          </Link>
          
          <h2>{config.title}</h2>
          <p>{config.description}</p>
          
          <form id="submission-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message show" style={{ textAlign: 'left' }}>
                {error}
              </div>
            )}

            {/* Render field form secara dinamis */}
            {config.fields.map((field) => (
              <div className="form-group" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={field.name.includes("Uraian") ? 5 : 3}
                    required
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
            
            <div className="form-group">
              <label htmlFor="document">Dokumen Pendukung (Opsional)</label>
              <input 
                type="file" 
                id="document" 
                className="file-input"
                onChange={handleFileChange}
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Ajukan Sekarang'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}