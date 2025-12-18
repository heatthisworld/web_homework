import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { logout } from "../services/authService";

const tabs = [
  { key: "home", label: "首页" },
  { key: "module1", label: "模块一" },
  { key: "module2", label: "模块二" },
  { key: "me", label: "我的" },
];

const Whiteboard: React.FC = () => {
  const [active, setActive] = useState("home");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutError("");
    setLogoutLoading(true);

    try {
      await logout();
      navigate("/");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "退出登录失败");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Layout
      title="白板页面（带左侧导航）"
      tabs={tabs}
      activeTab={active}
      onTabChange={setActive}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleLogout} disabled={logoutLoading}>
          {logoutLoading ? "正在退出..." : "退出登录"}
        </button>
      </div>

      {logoutError && <div className="auth-error">{logoutError}</div>}

      <h2>{active} 区域</h2>
      <p>这是白板内容，你可以在这里设计病人/医生/管理员的页面内容。</p>
      <p>左上角按钮可以打开左侧导航栏。</p>
    </Layout>
  );
};

export default Whiteboard;
