import React from "react";

export interface SidebarItem {
  key: string;
  label: string;
  hint?: string;
  icon?: string;
}

interface SidebarProps {
  activeKey: string;
  items: SidebarItem[];
  onSelect: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeKey, items, onSelect }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-mark">H</div>
          <div className="sidebar-title">
            <span>Hospital Admin</span>
            <small>后台驾驶舱</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {items.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${
              activeKey === item.key ? "active" : ""
            }`}
            onClick={() => onSelect(item.key)}
            type="button"
          >
            <span className="sidebar-icon">{item.icon ?? "•"}</span>
            <span className="sidebar-text">
              <span className="sidebar-label">{item.label}</span>
              {item.hint && <small className="sidebar-hint">{item.hint}</small>}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footline">
          <span className="footline-dot" />
          <span>值班监控已开启</span>
        </div>
        <div className="sidebar-footline secondary">
          <span className="footline-dot alt" />
          <span>模拟数据展示</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
