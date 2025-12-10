import React from "react";
import "../../mobile.css";

export interface TabItem {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, active, onChange }) => {
  return (
    <div className="tabbar-container">
      {tabs.map((item) => (
        <div
          key={item.key}
          className={`tabbar-item ${item.key === active ? "active" : ""}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default TabBar;
