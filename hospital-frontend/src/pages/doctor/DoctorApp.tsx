import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import Dashboard from './Dashboard';
import RegistrationManagement from './RegistrationManagement';
import PatientManagement from './PatientManagement';
import Schedule from './Schedule';
import Statistics from './Statistics';
import Settings from './Settings';

const DoctorApp: React.FC = () => {
  const location = useLocation();
  
  // 根据当前路由确定activeMenu
  const getActiveMenu = () => {
    const pathSegments = location.pathname.split('/');
    const path = pathSegments[pathSegments.length - 1] || '';
    return path === '' ? 'dashboard' : path;
  };

  return (
    <DoctorLayout activeMenu={getActiveMenu()}>
      <Routes>
        <Route 
          path="" 
          element={<Dashboard />} 
        />
        <Route 
          path="dashboard" 
          element={<Dashboard />} 
        />
        <Route 
          path="registration" 
          element={<RegistrationManagement />} 
        />
        <Route 
          path="patients" 
          element={<PatientManagement />} 
        />
        <Route 
          path="schedule" 
          element={<Schedule />} 
        />
        <Route 
          path="statistics" 
          element={<Statistics />} 
        />
        <Route 
          path="settings" 
          element={<Settings />} 
        />
      </Routes>
    </DoctorLayout>
  );
};

export default DoctorApp;
