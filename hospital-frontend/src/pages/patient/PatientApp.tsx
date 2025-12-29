import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import HomePage from './HomePage';
import RegistrationPage from './RegistrationPage';
import RecordsPage from './RecordsPage';
import ProfilePage from './ProfilePage';
import { logout } from '../../services/authService';

const PatientApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [debugMode, setDebugMode] = useState(false);

  const tabs = [
    { key: 'home', label: '首页' },
    { key: 'registration', label: '挂号' },
    { key: 'records', label: '记录' },
    { key: 'profile', label: '我的' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage debugMode={debugMode} />;
      case 'registration':
        return <RegistrationPage debugMode={debugMode} />;
      case 'records':
        return <RecordsPage debugMode={debugMode} />;
      case 'profile':
        return <ProfilePage debugMode={debugMode} />;
      default:
        return <HomePage debugMode={debugMode} />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('退出登录失败', err);
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <Layout 
      tabs={tabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      debugMode={debugMode}
      onToggleDebugMode={setDebugMode}
      onLogout={handleLogout}
      title="医院挂号系统"
    >
      {renderContent()}
    </Layout>
  );
};

export default PatientApp;
