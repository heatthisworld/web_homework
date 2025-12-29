import React from "react";
import { useNavigate } from "react-router-dom";
import "./patient.css";
import { usePatientData } from "./PatientApp";

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
];

const HomePage: React.FC<{ debugMode: boolean }> = () => {
  const navigate = useNavigate();
  const { patient } = usePatientData();

  const quickAccess = [
    { id: 1, icon: "👨‍⚕️", label: "医生查询", path: "/patient/doctors" },
    { id: 3, icon: "🗓", label: "快速挂号", path: "/patient/registration" },
    { id: 4, icon: "📋", label: "我的挂号", path: "/patient/records" },
    { id: 5, icon: "👤", label: "个人中心", path: "/patient/profile" },
  ];

  if (!patient) return null;

  const pendingVisits = patient.visitHistory?.filter(v => v.status === "pending") || [];
  const completedVisits = patient.visitHistory?.filter(v => v.status === "completed") || [];

  return (
    <div className="patient-home">
      <div className="user-info-card">
        <img src="/src/assets/Defaulthead.png" alt="用户头像" className="user-avatar" />
        <div className="user-info">
          <h3>{patient.name || "未命名"}</h3>
          <p className="user-detail">{patient.gender === "MALE" ? "男" : "女"} | {patient.age || "-"}岁</p>
          <p className="user-detail">手机号: {patient.phone || "-"}</p>
        </div>
      </div>

      {pendingVisits.length > 0 && (
        <div className="pending-visits-alert">
          <div className="alert-icon">⏰</div>
          <div className="alert-content">
            <div className="alert-title">您有 {pendingVisits.length} 个待就诊预约</div>
            <div className="alert-subtitle">请按时就诊</div>
          </div>
          <button className="alert-btn" onClick={() => navigate("/patient/records")}>查看</button>
        </div>
      )}

      <div className="quick-access">
        <h4>快捷功能</h4>
        <div className="quick-access-grid">
          {quickAccess.map((item) => (
            <div key={item.id} className="quick-access-item" onClick={() => navigate(item.path)}>
              <div className="quick-access-icon">{item.icon}</div>
              <div className="quick-access-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {patient.visitHistory && patient.visitHistory.length > 0 && (
        <div className="recent-visits">
          <div className="section-header-inline">
            <h4>最近就诊</h4>
            <span className="view-all" onClick={() => navigate("/patient/records")}>查看全部 →</span>
          </div>
          <div className="visit-list">
            {patient.visitHistory.slice(0, 3).map((visit) => (
              <div key={visit.id} className="visit-item">
                <div className="visit-date">{visit.appointmentTime?.split("T")[0] || "-"}</div>
                <div className="visit-info">
                  <div className="visit-department">{visit.department || "-"}</div>
                  <div className="visit-doctor">{visit.doctor || "-"}</div>
                </div>
                <div className={`visit-status status-${visit.status}`}>
                  {visit.status === "completed" ? "已完成" : visit.status === "cancelled" ? "已取消" : "待就诊"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="health-stats">
        <h4>就诊统计</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{patient.visitHistory?.length || 0}</div>
            <div className="stat-label">总就诊次数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{pendingVisits.length}</div>
            <div className="stat-label">待就诊</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{completedVisits.length}</div>
            <div className="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <div className="announcements">
        <h4>医院公告</h4>
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`announcement-item ${announcement.type === "important" ? "important" : ""}`}>
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