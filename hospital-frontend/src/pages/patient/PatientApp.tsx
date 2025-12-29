import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import HomePage from './HomePage';
import DoctorsPage from './DoctorsPage';
import DepartmentsPage from './DepartmentsPage';
import RegistrationPage from './RegistrationPage';
import RecordsPage from './RecordsPage';
import ProfilePage from './ProfilePage';
import { clearAuthCookie, clearUserInfo } from '../../services/authService';
import { fetchCurrentPatientDetails, fetchDoctors, type PatientDetails, type DoctorSummary } from '../../services/patientService';

interface CachedData {
  patient: PatientDetails | null;
  doctors: DoctorSummary[];
  loaded: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<CachedData>({ patient: null, doctors: [], loaded: false, refresh: async () => {} });

export const usePatientData = () => useContext(DataContext);

const PatientApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debugMode, setDebugMode] = useState(false);
  const [cachedData, setCachedData] = useState<CachedData>({ patient: null, doctors: [], loaded: false, refresh: async () => {} });
  const [error, setError] = useState("");

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
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const loadData = async () => {
    const debugData = {
      patient: {
        id: 0,
        username: "patient@example.com",
        name: "张三",
        gender: "MALE" as const,
        age: 30,
        phone: "13800000000",
        address: "北京朝阳",
        medicalHistory: [],
        visitHistory: [],
      },
      doctors: [
        { id: 1, name: "张医生", department: "内科", title: "主任医师", avatarUrl: "/files/Default.gif" },
        { id: 2, name: "李医生", department: "内科", title: "主治医师", avatarUrl: "/files/Default.gif" },
        { id: 3, name: "王医生", department: "儿科", title: "副主任医师", avatarUrl: "/files/Default.gif" },
      ],
      loaded: true
    };

    if (debugMode) {
      setCachedData({ ...debugData, refresh: loadData });
      return;
    }

    try {
      const [patient, doctors] = await Promise.all([
        fetchCurrentPatientDetails(),
        fetchDoctors()
      ]);
      setCachedData({ patient, doctors, loaded: true, refresh: loadData });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载数据失败");
    }
  };

  useEffect(() => {
    if (cachedData.loaded) return;
    loadData();
  }, [debugMode, cachedData.loaded]);

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

  const handleLogout = () => {
    clearAuthCookie();
    clearUserInfo();
    navigate('/');
  };

  if (error) {
    return (
      <Layout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        debugMode={debugMode}
        onToggleDebugMode={setDebugMode}
        onLogout={handleLogout}
        title="医院挂号系统"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: '#f56c6c', marginBottom: '12px' }}>加载失败</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{error}</div>
          <button
            onClick={() => {
              setCachedData({ patient: null, doctors: [], loaded: false, refresh: loadData });
              setError("");
            }}
            style={{ marginTop: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            重试
          </button>
        </div>
      </Layout>
    );
  }

  if (!cachedData.loaded) {
    return (
      <Layout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        debugMode={debugMode}
        onToggleDebugMode={setDebugMode}
        onLogout={handleLogout}
        title="医院挂号系统"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>正在加载...</div>
        </div>
      </Layout>
    );
  }

  return (
    <DataContext.Provider value={cachedData}>
      <Layout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        debugMode={debugMode}
        onToggleDebugMode={setDebugMode}
        onLogout={handleLogout}
        title="医院挂号系统"
      >
        <Routes>
          <Route path="/" element={<HomePage debugMode={debugMode} />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/registration" element={<RegistrationPage debugMode={debugMode} />} />
          <Route path="/records" element={<RecordsPage debugMode={debugMode} />} />
          <Route path="/profile" element={<ProfilePage debugMode={debugMode} onLogout={handleLogout} />} />
        </Routes>
      </Layout>
    </DataContext.Provider>
  );
};

export default PatientApp;