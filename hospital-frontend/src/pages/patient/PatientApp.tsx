import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import HomePage from './HomePage';
import DoctorsPage from './DoctorsPage';
import DepartmentsPage from './DepartmentsPage';
import RegistrationPage from './RegistrationPage';
import RecordsPage from './RecordsPage';
import ProfilePage from './ProfilePage';

const PatientApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debugMode, setDebugMode] = useState(false);

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/patient' || path === '/patient/') return 'home';
    if (path.includes('/registration')) return 'registration';
    if (path.includes('/records')) return 'records';
    if (path.includes('/profile')) return 'profile';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    const newTab = getActiveTabFromPath();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  const tabs = [
    { key: 'home', label: '首页' },
    { key: 'registration', label: '挂号' },
    { key: 'records', label: '记录' },
    { key: 'profile', label: '我的' }
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    navigate(`/patient/${key === 'home' ? '' : key}`);
  };

  return (
    <Layout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      debugMode={debugMode}
      onToggleDebugMode={setDebugMode}
      title="医院挂号系统"
    >
      <Routes>
        <Route path="/" element={<HomePage debugMode={debugMode} />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/registration" element={<RegistrationPage debugMode={debugMode} />} />
        <Route path="/records" element={<RecordsPage debugMode={debugMode} />} />
        <Route path="/profile" element={<ProfilePage debugMode={debugMode} />} />
      </Routes>
    </Layout>
  );
};

export default PatientApp;