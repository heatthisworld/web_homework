import React, { useState } from "react";
import Header from "./Header";
import TabBar from "./TabBar";
import type { TabItem } from "./TabBar";
import LeftSidebar from "./LeftSidebar";
import "../../mobile.css";

interface LayoutProps {
  title: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  debugMode?: boolean;
  onToggleDebugMode?: (value: boolean) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  debugMode = false,
  onToggleDebugMode,
  onLogout,
  children,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="layout-container">
      {/* 左侧导航栏 */}
      <LeftSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        debugMode={debugMode}
        onToggleDebugMode={onToggleDebugMode}
        onLogout={onLogout}
      />

      {/* 顶部 Header（带菜单按钮） */}
      <Header title={title} onMenuClick={() => setSidebarVisible(true)} />

      {/* 主内容区 */}
      <div className="layout-content">{children}</div>

      {/* 底部 TabBar */}
      <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
    </div>
  );
};

export default Layout;
