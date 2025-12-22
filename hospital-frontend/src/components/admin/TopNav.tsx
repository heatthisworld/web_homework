import React from "react";

interface TopNavProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ userName, userRole, onLogout }) => {
  const initials =
    userName.trim().length >= 2
      ? userName.trim().slice(-2)
      : userName.trim() || "NA";

  return (
    <header className="top-nav">
      <div className="top-nav-meta">
        <p className="top-nav-subtitle">医院挂号系统 · 管理后台</p>
        <h1 className="top-nav-title">运营控制台</h1>
      </div>

      <div className="top-nav-actions">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
        <button className="ghost-button" type="button" onClick={onLogout}>
          退出登录
        </button>
      </div>
    </header>
  );
};

export default TopNav;
