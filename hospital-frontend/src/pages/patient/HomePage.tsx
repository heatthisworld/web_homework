import React, { useEffect, useState } from "react";
import "./patient.css";
import {
  fetchCurrentPatientDetails,
  fetchDoctors,
  type PatientDetails,
  type DoctorSummary,
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

const mockDoctors: DoctorSummary[] = [
  { id: 1, name: "张医生", department: "内科", title: "主任医师" },
  { id: 2, name: "李医生", department: "儿科", title: "副主任医师" },
];

const announcements = [
  {
    id: 1,
    title: "医院门诊时间调整通知",
    content: "自2024年1月起，门诊时间调整为周一至周日 8:00-17:30",
    date: "2024-01-01",
  },
  {
    id: 2,
    title: "流感疫苗接种通知",
    content: "近期流感高发，我院提供流感疫苗接种服务，欢迎预约",
    date: "2023-12-15",
  },
];

const quickAccess = [
  { id: 1, icon: "🏥", label: "科室查询", path: "/patient/departments" },
  { id: 2, icon: "👨‍⚕️", label: "医生查询", path: "/patient/doctors" },
  { id: 3, icon: "🗓", label: "快速挂号", path: "/patient/registration" },
  { id: 4, icon: "📋", label: "我的挂号", path: "/patient/records" },
];

const HomePage: React.FC<HomePageProps> = ({ debugMode }) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (debugMode) {
        setPatient(mockPatient);
        setDoctors(mockDoctors);
        setLoading(false);
        return;
      }
      try {
        const [patientInfo, doctorList] = await Promise.all([
          fetchCurrentPatientDetails(),
          fetchDoctors(),
        ]);
        if (cancelled) return;
        setPatient(patientInfo);
        setDoctors(doctorList.slice(0, 4));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "加载患者信息失败，已显示示例数据",
        );
        setPatient(mockPatient);
        setDoctors(mockDoctors);
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
        <div className="announcement-item">正在加载，请稍候...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-home">
        <div className="announcement-item">未获取到患者信息</div>
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
          <p>患者ID: {patient.id}</p>
          <p>手机号: {patient.phone || "-"}</p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-access">
        <h4>快捷功能</h4>
        <div className="quick-access-grid">
          {quickAccess.map((item) => (
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
          {announcements.map((announcement) => (
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
          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-info">
                <div className="doctor-name">{doctor.name}</div>
                <div className="doctor-title">{doctor.title || "主治医生"}</div>
                <div className="doctor-department">{doctor.department}</div>
                <div className="doctor-specialty">擅长: 常见病诊疗</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
