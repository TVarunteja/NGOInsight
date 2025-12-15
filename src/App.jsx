import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ReportForm from "./Community Members/ReportForm";
import Navbar from "./Community Members/NavBar";
import CsvUpload from "./Community Members/CsvUpload";
import AdminDashboard from "./Admin/AdminDashboard";

/* ===================== LAYOUT ===================== */

function AppLayout() {

 

  return (
    <>
       <Navbar />

      <Routes>
        <Route path="/" element={<ReportForm />} />
        <Route path="/csv-upload" element={<CsvUpload />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

/* ===================== ROOT ===================== */

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
