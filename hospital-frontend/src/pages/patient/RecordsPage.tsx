import React, { useState } from "react";
import "./patient.css";
import { usePatient } from "../../contexts/PatientContext";
import { cancelRegistration } from "../../services/patientService";

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"registration" | "medical">("registration");
  const { patient, loading, error, refreshPatient } = usePatient();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");

  const registrationRecords = patient?.visitHistory
    .filter((v) => v.status !== "cancelled") // 过滤掉已取消的记录
    .map((v) => ({
      id: v.id,
      department: v.department || "-",
      doctor: v.doctor || "-",
      date: v.appointmentTime?.split("T")[0] || "-",
      time: v.appointmentTime?.split("T")[1]?.slice(0, 5) || "-",
      status: v.status === "completed" ? "已就诊" : "待就诊",
      recordId: `REG-${v.id}`
    })) || [];

  const medicalRecords = patient?.medicalHistory.map((m) => ({
    id: m.id,
    department: "-",
    doctor: m.doctor || "-",
    date: m.visitDate?.split("T")[0] || "-",
    diagnosis: m.diagnosis || "-",
    medications: m.medications || []
  })) || [];

  const handleCancel = async (id: number) => {
    if (!confirm("确定要取消这个挂号吗？")) return;

    setCancellingId(id);
    setCancelError("");

    try {
      await cancelRegistration(id);
      await refreshPatient();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "取消失败");
      setTimeout(() => setCancelError(""), 3000);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="records-page patient-page"><div className="announcement-item">正在加载，请稍候...</div></div>;

  return (
    <div className="records-page patient-page">
      <h3>我的记录</h3>
      {error && <div className="error-message">{error}</div>}
      {cancelError && <div className="error-message">{cancelError}</div>}

      <div className="internal-tabs">
        <div className={`internal-tab ${activeTab === "registration" ? "active" : ""}`} onClick={() => setActiveTab("registration")}>挂号记录</div>
        <div className={`internal-tab ${activeTab === "medical" ? "active" : ""}`} onClick={() => setActiveTab("medical")}>病历记录</div>
      </div>

      {activeTab === "registration" && (
        <div className="registration-records">
          {registrationRecords.length ? registrationRecords.map((record) => (
            <div key={record.id} className="record-item">
              <div className="record-header">
                <div className="record-department">{record.department}</div>
                <div className="record-status">{record.status}</div>
              </div>
              <div className="record-content">
                <p><strong>医生:</strong> {record.doctor}</p>
                <p><strong>时间:</strong> {record.date} {record.time}</p>
                <p><strong>挂号ID:</strong> {record.recordId}</p>
              </div>
              {record.status === "待就诊" && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(record.id)}
                  disabled={cancellingId === record.id}
                >
                  {cancellingId === record.id ? "取消中..." : "取消挂号"}
                </button>
              )}
            </div>
          )) : <div className="no-records">暂无挂号记录</div>}
        </div>
      )}

      {activeTab === "medical" && (
        <div className="medical-records">
          {medicalRecords.length ? medicalRecords.map((record) => (
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
          )) : <div className="no-records">暂无病历记录</div>}
        </div>
      )}
    </div>
  );
};

export default RecordsPage;