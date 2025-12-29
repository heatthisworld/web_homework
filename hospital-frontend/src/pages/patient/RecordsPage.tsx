import React, { useState, useMemo } from "react";
import "./patient.css";
import { usePatientData } from "./PatientApp";
import { cancelRegistration } from "../../services/patientService";

interface RecordsPageProps {
  debugMode: boolean;
}

const mockRegistrationRecords = [
  { id: 1, department: "内科", doctor: "张医生", date: "2024-01-15", time: "09:00", status: "已就诊", recordId: "REG20240115001" },
  { id: 2, department: "儿科", doctor: "赵医生", date: "2024-01-20", time: "10:30", status: "待就诊", recordId: "REG20240120002" },
  { id: 3, department: "外科", doctor: "王医生", date: "2023-12-28", time: "14:30", status: "已取消", recordId: "REG20231228003" }
];

const mockMedicalRecords = [
  { id: 1, department: "内科", doctor: "张医生", date: "2024-01-15", diagnosis: "高血压", medications: ["降压药", "阿司匹林"] },
  { id: 2, department: "儿科", doctor: "赵医生", date: "2023-11-10", diagnosis: "上呼吸道感染", medications: ["退烧药", "抗生素"] },
  { id: 3, department: "外科", doctor: "王医生", date: "2023-10-05", diagnosis: "软组织损伤", medications: ["止痛药", "消炎药"] }
];

const RecordsPage: React.FC<RecordsPageProps> = ({ debugMode }) => {
  const [activeTab, setActiveTab] = useState<"registration" | "medical">("registration");
  const { patient, refresh } = usePatientData();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancelledIds, setCancelledIds] = useState<Set<number>>(new Set());

  const registrationRecords = useMemo(() => {
    if (debugMode) return mockRegistrationRecords;
    if (!patient?.visitHistory) return [];

    return patient.visitHistory
      .map((v) => ({
        id: v.id,
        department: v.department || "-",
        doctor: v.doctor || "-",
        date: v.appointmentTime?.split("T")[0] || "-",
        time: v.appointmentTime?.split("T")[1]?.slice(0, 5) || "-",
        status: cancelledIds.has(v.id) ? "已取消" : (v.status === "completed" ? "已就诊" : v.status === "cancelled" ? "已取消" : "待就诊"),
        recordId: `REG-${v.id}`,
      }))
      // 过滤掉已取消的记录
      .filter(record => record.status !== "已取消");
  }, [debugMode, patient, cancelledIds]);

  const medicalRecords = useMemo(() => {
    if (debugMode) return mockMedicalRecords;
    if (!patient?.medicalHistory) return [];

    return patient.medicalHistory.map((m) => ({
      id: m.id,
      department: "-",
      doctor: m.doctor || "-",
      date: m.visitDate?.split("T")[0] || "-",
      diagnosis: m.diagnosis || "-",
      medications: m.medications || [],
    }));
  }, [debugMode, patient]);

  const handleCancelRegistration = async (id: number) => {
    if (!window.confirm("确定要取消这个挂号吗？")) {
      return;
    }

    setCancellingId(id);
    setError("");
    setMessage("");

    if (debugMode) {
      setCancelledIds(prev => new Set(prev).add(id));
      setMessage("取消成功（调试模式）");
      setCancellingId(null);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      await cancelRegistration(id);
      setCancelledIds(prev => new Set(prev).add(id));
      setMessage("取消挂号成功");

      // 刷新数据
      await refresh();

      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消挂号失败");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCancellingId(null);
    }
  };

  if (!patient) return null;

  return (
    <div className="records-page patient-page">
      <h3>我的记录</h3>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="internal-tabs">
        <div
          className={`internal-tab ${activeTab === "registration" ? "active" : ""}`}
          onClick={() => setActiveTab("registration")}
        >
          挂号记录
        </div>
        <div
          className={`internal-tab ${activeTab === "medical" ? "active" : ""}`}
          onClick={() => setActiveTab("medical")}
        >
          病历记录
        </div>
      </div>

      {activeTab === "registration" && (
        <div className="registration-records">
          {registrationRecords.length ? (
            registrationRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-header">
                  <div className="record-department">{record.department}</div>
                  <div className={`record-status ${record.status}`}>{record.status}</div>
                </div>
                <div className="record-content">
                  <p><strong>医生:</strong> {record.doctor}</p>
                  <p><strong>时间:</strong> {record.date} {record.time}</p>
                  <p><strong>挂号ID:</strong> {record.recordId}</p>
                </div>
                {record.status === "待就诊" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelRegistration(record.id)}
                    disabled={cancellingId === record.id}
                  >
                    {cancellingId === record.id ? "取消中..." : "取消挂号"}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="no-records">暂无挂号记录</div>
          )}
        </div>
      )}

      {activeTab === "medical" && (
        <div className="medical-records">
          {medicalRecords.length ? (
            medicalRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-header">
                  <div className="record-department">{record.department}</div>
                  <div className="record-date">{record.date}</div>
                </div>
                <div className="record-content">
                  <p><strong>医生:</strong> {record.doctor}</p>
                  <p><strong>诊断:</strong> {record.diagnosis}</p>
                  <p><strong>用药:</strong> {record.medications.join(", ")}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-records">暂无病历记录</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
