import React, { useEffect, useState } from "react";
import "./patient.css";
import {
  fetchCurrentPatientDetails,
  type PatientDetails,
} from "../../services/patientService";

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
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (debugMode) {
        setPatientDetails({
          id: 0,
          username: "patient@example.com",
          name: "张三",
          gender: "MALE",
          age: 30,
          phone: "13800000000",
          address: "北京朝阳",
          medicalHistory: [],
          visitHistory: [],
        });
        setLoading(false);
        return;
      }
      try {
        const details = await fetchCurrentPatientDetails();
        if (cancelled) return;
        setPatientDetails(details);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? `${err.message}，已显示示例数据` : "加载失败，已显示示例数据",
        );
        setPatientDetails({
          id: 0,
          username: "patient@example.com",
          name: "张三",
          gender: "MALE",
          age: 30,
          phone: "13800000000",
          address: "北京朝阳",
          medicalHistory: [],
          visitHistory: [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [debugMode]);

  const registrationRecords = debugMode
    ? mockRegistrationRecords
    : patientDetails?.visitHistory.map((v) => ({
        id: v.id,
        department: v.department || "-",
        doctor: v.doctor || "-",
        date: v.appointmentTime?.split("T")[0] || "-",
        time: v.appointmentTime?.split("T")[1]?.slice(0, 5) || "-",
        status: v.status === "completed" ? "已就诊" : v.status === "cancelled" ? "已取消" : "待就诊",
        recordId: `REG-${v.id}`,
      })) || [];

  const medicalRecords = debugMode
    ? mockMedicalRecords
    : patientDetails?.medicalHistory.map((m) => ({
        id: m.id,
        department: "-",
        doctor: m.doctor || "-",
        date: m.visitDate?.split("T")[0] || "-",
        diagnosis: m.diagnosis || "-",
        medications: m.medications || [],
      })) || [];

  if (loading) {
    return (
      <div className="records-page patient-page">
        <div className="announcement-item">正在加载，请稍候...</div>
      </div>
    );
  }

  return (
    <div className="records-page patient-page">
      <h3>我的记录</h3>
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
                  <div className="record-status">{record.status}</div>
                </div>
                <div className="record-content">
                  <p>
                    <strong>医生:</strong> {record.doctor}
                  </p>
                  <p>
                    <strong>时间:</strong> {record.date} {record.time}
                  </p>
                  <p>
                    <strong>挂号ID:</strong> {record.recordId}
                  </p>
                </div>
                {record.status === "待就诊" && <button className="cancel-btn">取消挂号</button>}
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
                  <p>
                    <strong>医生:</strong> {record.doctor}
                  </p>
                  <p>
                    <strong>诊断:</strong> {record.diagnosis}
                  </p>
                  <p>
                    <strong>用药:</strong> {record.medications.join(", ")}
                  </p>
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
