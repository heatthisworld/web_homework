import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "../pages/Auth/AuthPage";
import Whiteboard from "../pages/Whiteboard";
import PatientApp from "../pages/patient/PatientApp";
import DoctorApp from "../pages/doctor/DoctorApp";
import AdminApp from "../pages/admin/AdminApp";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/whiteboard" element={<Whiteboard />} />
      <Route path="/patient/*" element={<PatientApp />} />
      <Route path="/doctor/*" element={<DoctorApp />} />
      <Route path="/admin/*" element={<AdminApp />} />
      {/* 可以添加更多路由 */}
    </Routes>
  );
};