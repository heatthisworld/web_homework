import React from 'react';

const TopNav: React.FC = () => {
  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-title">医生管理平台</div>
        <div className="top-nav-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="搜索患者、挂号记录..." />
        </div>
      </div>
      
      <div className="top-nav-right">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">张</div>
          <div className="user-name">张医生</div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
