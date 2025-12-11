import React from 'react';
import './patient.css';

const ProfilePage: React.FC = () => {
  // 模拟数据
  const userInfo = {
    name: '张三',
    patientId: 'PAT202300123',
    gender: '男',
    age: 35,
    phone: '138****1234',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区某某街道123号'
  };

  const menuItems = [
    { id: 1, icon: '📋', label: '我的挂号', path: '/patient/records' },
    { id: 2, icon: '📊', label: '我的病历', path: '/patient/medical-records' },
    { id: 3, icon: '🔔', label: '系统通知', path: '/patient/notifications' },
    { id: 4, icon: '⚙️', label: '设置', path: '/patient/settings' },
    { id: 5, icon: '❓', label: '使用帮助', path: '/patient/help' },
    { id: 6, icon: '📞', label: '联系客服', path: '/patient/contact' }
  ];

  return (
    <div className="profile-page patient-page">
      {/* 用户信息卡片 */}
      <div className="user-info-card">
        <img 
          src="/src/assets/Defaulthead.png" 
          alt="用户头像" 
          className="user-avatar"
        />
        <div className="user-info">
          <h3>{userInfo.name}</h3>
          <p>患者ID: {userInfo.patientId}</p>
          <p>{userInfo.gender} | {userInfo.age}岁</p>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="detail-info">
        <div className="info-item">
          <span className="info-label">手机号码:</span>
          <span className="info-value">{userInfo.phone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">邮箱地址:</span>
          <span className="info-value">{userInfo.email}</span>
        </div>
        <div className="info-item">
          <span className="info-label">联系地址:</span>
          <span className="info-value">{userInfo.address}</span>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="menu-section">
        <h4>功能菜单</h4>
        <div className="menu-list">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item">
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-label">{item.label}</div>
              <div className="menu-arrow">›</div>
            </div>
          ))}
        </div>
      </div>

      {/* 辅助信息 */}
      <div className="auxiliary-info">
        <div className="info-item">
          <span className="info-label">系统版本:</span>
          <span className="info-value">v1.0.0</span>
        </div>
        <div className="info-item">
          <span className="info-label">用户协议:</span>
          <span className="info-value">查看</span>
        </div>
        <div className="info-item">
          <span className="info-label">隐私政策:</span>
          <span className="info-value">查看</span>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <button className="logout-btn">退出登录</button>
    </div>
  );
};

export default ProfilePage;