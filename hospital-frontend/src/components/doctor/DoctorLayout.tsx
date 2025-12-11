import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './DoctorLayout.css';

interface DoctorLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children, activeMenu }) => {
  return (
    <div className="doctor-layout">
      {/* 左侧导航栏 */}
      <Sidebar activeMenu={activeMenu} />
      
      {/* 右侧内容区 */}
      <div className="doctor-content">
        {/* 顶部导航 */}
        <TopNav />
        
        {/* 主内容 */}
        <main className="main-content">
          {children}
        </main>
        
        {/* 页脚 */}
        <footer className="footer">
          <p>医院挂号系统 © 2025 | 医生管理平台</p>
        </footer>
      </div>
    </div>
  );
};

export default DoctorLayout;
