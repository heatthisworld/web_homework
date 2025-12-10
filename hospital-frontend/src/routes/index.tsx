import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "../pages/Auth/AuthPage";
import Whiteboard from "../pages/Whiteboard";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/whiteboard" element={<Whiteboard />} />
      {/* 可以添加更多路由 */}
    </Routes>
  );
};