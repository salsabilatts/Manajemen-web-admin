// src/pages/Register.jsx (Versi Hybrid - Lokal JSON + API Kelurahan)

import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/login.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
//const WILAYAH_API_BASE_URL = "https://wilayah.id/api"; // API untuk Kelurahan

export default function Register() {
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE ALAMAT ---
  const [bantenData, setBantenData] = useState(null); // Menyimpan data JSON lokal
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // --- LOGIKA MEMUAT ALAMAT ---
  
  // 1. Muat data JSON lokal saat halaman dibuka
  useEffect(() => {
    // Kita fetch dari folder 'public'
    fetch("/data/banten_data.json")
      .then(res => res.json())
      .then(data => {
        setBantenData(data); // Simpan semua data
        setSelectedProvince(data.provinsi.id); // Otomatis set Provinsi BANTEN
        setCities(data.cities); // Langsung isi daftar kota
      })
      .catch(err => console.error("Gagal memuat banten_data.json:", err));
  }, []);

  // 2. Saat Kota berubah, isi daftar Kecamatan (dari data lokal)
  const handleCityChange = (cityCode) => {
    setSelectedCity(cityCode);
    setDistricts([]);
    setVillages([]);
    setSelectedDistrict("");
    setSelectedVillage("");
    
    if (cityCode && bantenData) {
      const selectedCityData = bantenData.cities.find(c => c.id === cityCode);
      if (selectedCityData) {
        setDistricts(selectedCityData.districts);
      }
    }
  };

  // 3. Saat Kecamatan berubah, panggil API Kelurahan
// 3. Saat Kecamatan berubah, panggil API Kelurahan
  const handleDistrictChange = (districtCode) => {
    setSelectedDistrict(districtCode);
    setVillages([]);
    setSelectedVillage("");

    if (districtCode) {
      setIsLoadingVillages(true);
      
      let formattedId = districtCode;
      if (formattedId.length >= 6) {
        formattedId = `${formattedId.substring(0, 2)}.${formattedId.substring(2, 4)}.${formattedId.substring(4, 6)}`;
      }

      // --- PERUBAHAN UTAMA DI SINI ---
      // Panggil "jembatan" di backend Go Anda
      axios.get(`${BASE_URL}/api/v1/wilayah/villages/${formattedId}`) 
        .then(res => {
          // Backend Go kita sudah meneruskan data dari wilayah.id
          setVillages(res.data.data); 
          setIsLoadingVillages(false);
        })
        .catch(err => {
          console.error("Gagal memuat kelurahan:", err);
          setIsLoadingVillages(false);
        });
      // -------------------------------
    }
  };

  // --- HANDLER FORM ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!selectedProvince || !selectedCity || !selectedDistrict || !selectedVillage) {
        setError("Alamat harus diisi lengkap.");
        setIsLoading(false);
        return;
    }

    // Helper untuk mendapatkan nama dari ID
    const getSelectedText = (list, code) => list.find(item => item.id === code)?.name || "";
    const getSelectedVillageText = (list, code) => list.find(item => item.code === code)?.name || "";

    try {
      const payload = {
        ...formData,
        provinsi: bantenData.provinsi.name,
        kabupaten: getSelectedText(bantenData.cities, selectedCity),
        kecamatan: getSelectedText(districts, selectedDistrict),
        kelurahan: getSelectedVillageText(villages, selectedVillage), // API Kelurahan pakai 'code'
      };
      
      const res = await axios.post(`${BASE_URL}/api/v1/auth/register`, payload);

      setIsLoading(false);
      alert(res.data.message || "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
      navigate("/");

    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || "Registrasi gagal. Coba lagi.";
      setError(errorMessage);
      console.error(err);
    }
  };

  // --- RENDER ---
  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: '500px', marginTop: '3rem', marginBottom: '3rem' }}>
        <div className="login-header">
          <i className="fas fa-user-plus"></i>
          <h1>{step === 1 ? 'Langkah 1: Data Diri' : 'Langkah 2: Alamat'}</h1>
          <p>Daftarkan diri Anda untuk memulai</p>
        </div>

        {error && <div className="error-message show">{error}</div>}

        <form onSubmit={step === 1 ? handleNextStep : handleRegister}>
          
          {/* --- TAMPILAN LANGKAH 1 --- */}
          <div style={{ display: step === 1 ? 'block' : 'none' }}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input type="text" name="full_name" required onChange={handleChange} value={formData.full_name} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required onChange={handleChange} value={formData.email} />
            </div>
            <div className="form-group">
              <label>Nomor HP</label>
              <input type="tel" name="phone" required onChange={handleChange} value={formData.phone} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" minLength="6" required onChange={handleChange} value={formData.password} />
            </div>
            <div className="form-group">
              <label>Konfirmasi Password</label>
              <input type="password" name="password_confirmation" required onChange={handleChange} value={formData.password_confirmation} />
            </div>
            <button type="button" className="login-btn" onClick={handleNextStep}>
              Selanjutnya
            </button>
          </div>

          {/* --- TAMPILAN LANGKAH 2 --- */}
          <div style={{ display: step === 2 ? 'block' : 'none' }}>
            <div className="form-group">
              <label>Provinsi</label>
              <select value={selectedProvince} disabled>
                <option value={selectedProvince}>{bantenData?.provinsi.name}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kabupaten/Kota</label>
              <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} required={step === 2}>
                <option value="">Pilih Kabupaten/Kota</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kecamatan</label>
              <select value={selectedDistrict} onChange={(e) => handleDistrictChange(e.target.value)} required={step === 2} disabled={!selectedCity}>
                <option value="">Pilih Kecamatan</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kelurahan/Desa</label>
              <select value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} required={step === 2} disabled={!selectedDistrict}>
                <option value="">{isLoadingVillages ? "Memuat..." : "Pilih Kelurahan/Desa"}</option>
                {villages.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="login-btn" onClick={() => setStep(1)} style={{ backgroundColor: '#6c757d' }}>
                Kembali
              </button>
              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </div>

          <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
            Sudah punya akun? <Link to="/" style={{color: '#2563eb', fontWeight: '600'}}>Login di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}