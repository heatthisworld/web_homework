import React from "react";
import "../../mobile.css";
import { logout as apiLogout } from "../../services/authService";

interface LeftSidebarProps {
  visible: boolean;
  onClose: () => void;
  debugMode?: boolean;
  onToggleDebugMode?: (value: boolean) => void;
  onLogout?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  visible,
  onClose,
  debugMode = false,
  onToggleDebugMode,
  onLogout,
}) => {
  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
        return;
      }
      await apiLogout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      // 退出后直接返回登录页
      window.location.href = "/";
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    window.location.href = "/";
  };

  return (
    <>
      {/* 半透明遮罩 */}
      {visible && <div className="sidebar-mask" onClick={onClose} />}

      {/* 左侧侧边栏 */}
      <div className={`sidebar-container ${visible ? "show" : ""}`}>
        <div className="sidebar-header">导航菜单</div>

        <div className="sidebar-item">🏠 首页</div>

        <div className="sidebar-divider" />
        <button className="sidebar-item sidebar-button" onClick={handleRefresh}>
          🔄 刷新页面
        </button>
        <button className="sidebar-item sidebar-button" onClick={handleBackToLogin}>
          ⬅️ 返回登录
        </button>
        <button className="sidebar-item sidebar-button" onClick={handleLogout}>
          🚪 退出登录
        </button>

        <div className="sidebar-divider" />
        <label className="sidebar-item sidebar-toggle">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => onToggleDebugMode?.(e.target.checked)}
          />
          <span className="toggle-label">开启Debug 模式（使用模拟数据）</span>
        </label>

        <div
          className="sidebar-item"
          style={{ color: "#ef4444", fontWeight: 700, marginTop: 12, cursor: "pointer" }}
          onClick={onLogout}
        >
          🚪 退出登录
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
