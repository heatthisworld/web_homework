import React from "react";
import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import TopNav from "./TopNav";
import "./AdminLayout.css";

export interface AdminTab {
  key: string;
  label: string;
  path: string;
  icon?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  menuItems: SidebarItem[];
  tabs: AdminTab[];
  onMenuSelect: (key: string) => void;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
  currentUser: { name: string; role: string };
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeMenu,
  menuItems,
  tabs,
  onMenuSelect,
  onTabChange,
  onTabClose,
  currentUser,
  onLogout,
}) => {
  return (
    <div className="admin-shell">
      <Sidebar activeKey={activeMenu} items={menuItems} onSelect={onMenuSelect} />

      <div className="admin-surface">
        <TopNav
          userName={currentUser.name}
          userRole={currentUser.role}
          onLogout={onLogout}
        />

        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${tab.key === activeMenu ? "active" : ""}`}
              onClick={() => onTabChange(tab.key)}
              type="button"
            >
              <span className="tab-icon">{tab.icon ?? "•"}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.key !== "dashboard" && (
                <span
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.key);
                  }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
