import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeMenu }) => {
  return (
    <div className="admin-layout">
      {/* 左侧导航栏 */}
      <Sidebar activeMenu={activeMenu} />
      
      {/* 右侧内容区 */}
      <div className="admin-content">
        {/* 顶部导航 */}
        <TopNav />
        
        {/* 主内容 */}
        <main className="main-content">
          {children}
        </main>
        
        {/* 页脚 */}
        <footer className="footer">
          <p>医院挂号系统 © 2025 | 系统管理员平台</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;