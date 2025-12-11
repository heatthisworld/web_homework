import React from "react";
import "../../mobile.css";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void; // ← 加上这个
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <div className="header-container">
      {/* 菜单按钮 */}
      {onMenuClick && (
        <div className="header-menu-btn" onClick={onMenuClick}>
          ☰
        </div>
      )}
      <div className="header-title">{title}</div>
    </div>
  );
};

export default Header;
