import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import HomePage from './HomePage';
import RegistrationPage from './RegistrationPage';
import RecordsPage from './RecordsPage';
import ProfilePage from './ProfilePage';

const PatientApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { key: 'home', label: '首页' },
    { key: 'registration', label: '挂号' },
    { key: 'records', label: '记录' },
    { key: 'profile', label: '我的' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'registration':
        return <RegistrationPage />;
      case 'records':
        return <RecordsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout 
      tabs={tabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      title="医院挂号系统"
    >
      {renderContent()}
    </Layout>
  );
};

export default PatientApp;