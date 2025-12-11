import React from 'react';
import './patient.css';

const HomePage: React.FC = () => {
  // 模拟数据
  const announcements = [
    { id: 1, title: '医院门诊时间调整通知', content: '自2024年1月起，我院门诊时间调整为周一至周日 8:00-17:30', date: '2023-12-20' },
    { id: 2, title: '流感疫苗接种通知', content: '近期流感高发，我院提供流感疫苗接种服务，欢迎预约', date: '2023-12-15' }
  ];

  const quickAccess = [
    { id: 1, icon: '🏥', label: '科室查询', path: '/patient/departments' },
    { id: 2, icon: '👨⚕️', label: '医生查询', path: '/patient/doctors' },
    { id: 3, icon: '📅', label: '快速挂号', path: '/patient/registration' },
    { id: 4, icon: '📋', label: '我的挂号', path: '/patient/records' }
  ];

  const recommendedDoctors = [
    { id: 1, name: '张医生', title: '主任医师', department: '内科', specialty: '心血管疾病', rating: 4.8 },
    { id: 2, name: '李医生', title: '副主任医师', department: '儿科', specialty: '儿童呼吸系统', rating: 4.9 }
  ];

  return (
    <div className="patient-home">
      {/* 用户信息卡片 */}
      <div className="user-info-card">
        <img 
          src="/src/assets/Defaulthead.png" 
          alt="用户头像" 
          className="user-avatar"
        />
        <div className="user-info">
          <h3>张三</h3>
          <p>患者ID: PAT202300123</p>
          <p>手机号码: 138****1234</p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-access">
        <h4>快捷功能</h4>
        <div className="quick-access-grid">
          {quickAccess.map(item => (
            <div key={item.id} className="quick-access-item">
              <div className="quick-access-icon">{item.icon}</div>
              <div className="quick-access-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 医院公告 */}
      <div className="announcements">
        <h4>医院公告</h4>
        <div className="announcement-list">
          {announcements.map(announcement => (
            <div key={announcement.id} className="announcement-item">
              <div className="announcement-title">{announcement.title}</div>
              <div className="announcement-content">{announcement.content}</div>
              <div className="announcement-date">{announcement.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 推荐医生 */}
      <div className="recommended-doctors">
        <h4>推荐医生</h4>
        <div className="doctor-list">
          {recommendedDoctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-info">
                <div className="doctor-name">{doctor.name}</div>
                <div className="doctor-title">{doctor.title}</div>
                <div className="doctor-department">{doctor.department}</div>
                <div className="doctor-specialty">专长: {doctor.specialty}</div>
                <div className="doctor-rating">评分: ⭐ {doctor.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;