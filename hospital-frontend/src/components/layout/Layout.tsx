import React from "react";
import Header from "./Header";
import TabBar from "./TabBar";
import type { TabItem } from "./TabBar";
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
  return (
    <div className="layout-container">
      <Header title={title} />

      <div className="layout-content">
        {children}
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
    </div>
  );
};

export default Layout;
