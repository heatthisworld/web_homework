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
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="layout-container">
      {/* 左侧导航栏 */}
      <LeftSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* 顶部 Header（添加按钮） */}
      <Header title={title} onMenuClick={() => setSidebarVisible(true)} />

      {/* 主内容区 */}
      <div className="layout-content">
        {children}
      </div>

      {/* 底部 TabBar */}
      <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
    </div>
  );
};

export default Layout;
