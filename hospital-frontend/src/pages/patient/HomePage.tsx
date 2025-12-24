import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./patient.css";
import {
  fetchCurrentPatientDetails,
  type PatientDetails,
} from "../../services/patientService";

interface HomePageProps {
  debugMode: boolean;
}

const mockPatient: PatientDetails = {
  id: 0,
  username: "patient@example.com",
  name: "张三",
  gender: "MALE",
  age: 32,
  phone: "138****1234",
  address: "北京市朝阳区朝阳北路123号",
  medicalHistory: [],
  visitHistory: [],
};

const announcements = [
  {
    id: 1,
    title: "医院门诊时间调整通知",
    content: "自2024年1月起，门诊时间调整为周一至周日 8:00-17:30",
    date: "2024-01-01",
    type: "important",
  },
  {
    id: 2,
    title: "流感疫苗接种通知",
    content: "近期流感高发，我院提供流感疫苗接种服务，欢迎预约",
    date: "2023-12-15",
    type: "normal",
  },
  {
    id: 3,
    title: "春节假期门诊安排",
    content: "春节期间（1月21日-27日）急诊24小时开放，门诊部分开放",
    date: "2023-12-10",
    type: "normal",
  },
];

const HomePage: React.FC<HomePageProps> = ({ debugMode }) => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const quickAccess = [
    { id: 1, icon: "👨‍⚕️", label: "医生查询", path: "/patient/doctors" },
    { id: 2, icon: "🏥", label: "科室查询", path: "/patient/departments" },
    { id: 3, icon: "🗓", label: "快速挂号", path: "/patient/registration" },
    { id: 4, icon: "📋", label: "我的挂号", path: "/patient/records" },
    { id: 5, icon: "👤", label: "个人中心", path: "/patient/profile" },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (debugMode) {
        setPatient(mockPatient);
        setLoading(false);
        return;
      }
      try {
        const patientInfo = await fetchCurrentPatientDetails();
        if (cancelled) return;
        setPatient(patientInfo);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "加载患者信息失败，已显示示例数据",
        );
        setPatient(mockPatient);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [debugMode]);

  if (loading) {
    return (
      <div className="patient-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载，请稍候...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-home">
        <div className="error-container">未获取到患者信息</div>
      </div>
    );
  }

  return (
    <div className="patient-home">
      {error && <div className="error-message">{error}</div>}

      {/* 用户信息卡片 */}
      <div className="user-info-card">
        <img
          src="/src/assets/Defaulthead.png"
          alt="用户头像"
          className="user-avatar"
        />
        <div className="user-info">
          <h3>{patient.name || "未命名"}</h3>
          <p className="user-detail">
            {patient.gender === "MALE" ? "男" : "女"} | {patient.age || "-"}岁
          </p>
          <p className="user-detail">手机号: {patient.phone || "-"}</p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-access">
        <h4>快捷功能</h4>
        <div className="quick-access-grid">
          {quickAccess.map((item) => (
            <div
              key={item.id}
              className="quick-access-item"
              onClick={() => navigate(item.path)}
            >
              <div className="quick-access-icon">{item.icon}</div>
              <div className="quick-access-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 就诊记录快览 */}
      {patient.visitHistory && patient.visitHistory.length > 0 && (
        <div className="recent-visits">
          <h4>最近就诊</h4>
          <div className="visit-list">
            {patient.visitHistory.slice(0, 3).map((visit) => (
              <div key={visit.id} className="visit-item">
                <div className="visit-date">
                  {visit.appointmentTime?.split("T")[0] || "-"}
                </div>
                <div className="visit-info">
                  <div className="visit-department">{visit.department || "-"}</div>
                  <div className="visit-doctor">{visit.doctor || "-"}</div>
                </div>
                <div className={`visit-status status-${visit.status}`}>
                  {visit.status === "completed" ? "已完成" :
                   visit.status === "cancelled" ? "已取消" : "待就诊"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 医院公告 */}
      <div className="announcements">
        <h4>医院公告</h4>
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-item ${announcement.type === "important" ? "important" : ""}`}
            >
              <div className="announcement-header">
                <div className="announcement-title">{announcement.title}</div>
                <div className="announcement-date">{announcement.date}</div>
              </div>
              <div className="announcement-content">{announcement.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
