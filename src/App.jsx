import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManajemenUser from "./pages/Manajemen-user";
import Umkm from "./pages/umkm";
import Pendidikan from "./pages/Pendidikan";
import Kesehatan from "./pages/Kesehatan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/users" element={<ManajemenUser />} />
        <Route path="/umkm" element={<Umkm />} />
        <Route path="/pendidikan" element={<Pendidikan />} />
        <Route path="/kesehatan" element={<Kesehatan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;