import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeMenu: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { key: 'dashboard', label: '仪表盘', icon: '📊', path: '' },
    { key: 'users', label: '用户管理', icon: '👥', path: 'users' },
    { key: 'departments', label: '科室管理', icon: '🏥', path: 'departments' },
    { key: 'schedule', label: '排班管理', icon: '📅', path: 'schedule' },
    { key: 'registrations', label: '挂号管理', icon: '📋', path: 'registrations' },
    { key: 'statistics', label: '统计报表', icon: '📈', path: 'statistics' },
    { key: 'settings', label: '系统设置', icon: '⚙️', path: 'settings' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(`/admin/${path}`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">系统管理员</div>
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