import React, { useEffect, useState } from 'react';
import { getCurrentDoctor } from '../../services/doctorService';

const TopNav: React.FC = () => {
  const [doctorName, setDoctorName] = useState<string>('医生');

  useEffect(() => {
    let cancelled = false;

    const loadDoctor = async () => {
      try {
        const doctor = await getCurrentDoctor();
        if (!cancelled && doctor?.name) {
          setDoctorName(doctor.name);
        }
      } catch (err) {
        console.error('获取医生信息失败', err);
      }
    };

    loadDoctor();
    return () => {
      cancelled = true;
    };
  }, []);

  const avatarText = doctorName ? doctorName.charAt(0) : '医';

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-title">医生管理平台</div>
        <div className="top-nav-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="搜索患者、挂号记录..." />
        </div>
      </div>
      
      <div className="top-nav-right">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">{avatarText}</div>
          <div className="user-name">{doctorName}</div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
