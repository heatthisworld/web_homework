import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import ScheduleManagement from './ScheduleManagement';
import RegistrationManagement from './RegistrationManagement';
import Statistics from './Statistics';
import Settings from './Settings';

const AdminApp: React.FC = () => {
  const location = useLocation();
  
  // 根据当前路由确定activeMenu
  const getActiveMenu = () => {
    const path = location.pathname.split('/').pop() || '';
    return path === '' ? 'dashboard' : path;
  };

  return (
    <AdminLayout activeMenu={getActiveMenu()}>
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
          path="users" 
          element={<UserManagement />} 
        />
        <Route 
          path="departments" 
          element={<DepartmentManagement />} 
        />
        <Route 
          path="schedule" 
          element={<ScheduleManagement />} 
        />
        <Route 
          path="registrations" 
          element={<RegistrationManagement />} 
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
    </AdminLayout>
  );
};

export default AdminApp;