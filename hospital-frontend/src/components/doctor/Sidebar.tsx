import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeMenu: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { key: 'dashboard', label: '仪表盘', icon: '📊', path: '' },
    { key: 'registration', label: '挂号管理', icon: '📋', path: 'registration' },
    { key: 'patients', label: '患者管理', icon: '👥', path: 'patients' },
    { key: 'schedule', label: '日程安排', icon: '📅', path: 'schedule' },
    { key: 'statistics', label: '统计报表', icon: '📈', path: 'statistics' },
    { key: 'settings', label: '个人设置', icon: '⚙️', path: 'settings' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(`/doctor/${path}`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">医生管理系统</div>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map(item => (
          <div 
            key={item.key}
            className={`menu-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.path)}
            style={{ cursor: 'pointer' }}
          >
            <span className="menu-item-icon">{item.icon}</span>
            <span className="menu-item-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
