import React, { useEffect, useMemo, useState } from "react";
import "./patient.css";
import {
  createRegistration,
  fetchCurrentPatientDetails,
  fetchDiseases,
  fetchDoctors,
  type Disease,
  type DoctorSummary,
  type PatientDetails,
} from "../../services/patientService";

interface RegistrationPageProps {
  debugMode: boolean;
}

const mockDoctors: DoctorSummary[] = [
  { id: 1, name: "张医生", department: "内科", title: "主任医师" },
  { id: 2, name: "李医生", department: "内科", title: "主治医师" },
  { id: 3, name: "王医生", department: "儿科", title: "副主任医师" },
];

const mockDiseases: Disease[] = [
  { id: 1, name: "高血压", department: "内科" },
  { id: 2, name: "感冒", department: "内科" },
  { id: 3, name: "过敏", department: "儿科" },
];

const timeSlots = ["08:30", "09:00", "10:00", "14:00", "15:00", "16:00"];

const RegistrationPage: React.FC<RegistrationPageProps> = ({ debugMode }) => {
  const [doctors, setDoctors] = useState<DoctorSummary[]>(mockDoctors);
  const [diseases, setDiseases] = useState<Disease[]>(mockDiseases);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"department" | "doctor" | "date" | "time" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 获取所有科室
  const departments = useMemo(() => {
    return [...new Set(doctors.map(d => d.department))];
  }, [doctors]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (debugMode) {
        setPatient({
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
        const [patientDetail, doctorList, diseaseList] = await Promise.all([
          fetchCurrentPatientDetails(),
          fetchDoctors(),
          fetchDiseases(),
        ]);
        if (cancelled) return;
        setPatient(patientDetail);
        setDoctors(doctorList.length ? doctorList : mockDoctors);
        setDiseases(diseaseList.length ? diseaseList : mockDiseases);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? `${err.message}，已启用示例数据`
            : "加载失败，已启用示例数据",
        );
        setPatient({
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
        setDoctors(mockDoctors);
        setDiseases(mockDiseases);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [debugMode]);

  const filteredDoctors = useMemo(() => {
    if (!selectedDepartment) return doctors;
    return doctors.filter((doc) => doc.department === selectedDepartment);
  }, [selectedDepartment, doctors]);

  const availableDiseases = useMemo(() => {
    if (!selectedDepartment) return diseases;
    return diseases.filter((d) => d.department === selectedDepartment);
  }, [selectedDepartment, diseases]);

  const handleSubmit = async () => {
    if (!patient || !selectedDoctor || !selectedDisease || !selectedDate || !selectedTime) {
      setError("请完成所有选择");
      return;
    }

    if (debugMode) {
      setRegistrationSuccess(true);
      setTimeout(() => setRegistrationSuccess(false), 3000);
      return;
    }

    try {
      const appointmentTime = `${selectedDate}T${selectedTime}:00`;
      await createRegistration({
        patientId: patient.id,
        doctorId: selectedDoctor,
        diseaseId: selectedDisease,
        appointmentTime,
      });
      setRegistrationSuccess(true);
      setError("");

      // 重置选择
      setTimeout(() => {
        setRegistrationSuccess(false);
        setSelectedDepartment("");
        setSelectedDoctor(null);
        setSelectedDisease(null);
        setSelectedDate("");
        setSelectedTime(null);
        setExpandedSection(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交挂号失败");
    }
  };

  if (loading) {
    return (
      <div className="registration-page">
        <div className="announcement-item">正在加载，请稍候...</div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <h3>在线挂号</h3>
      {error && <div className="error-message">{error}</div>}

      {registrationSuccess ? (
        <div className="success-message">
          <h4>✅ 挂号成功！</h4>
          <p>您已成功挂号，请按时就诊。</p>
        </div>
      ) : (
        <>
          {/* 当前选择信息 */}
          <div className="current-selection">
            <h4>当前选择</h4>
            <div className="selection-info">
              <div className="info-item">
                <span className="info-label">科室:</span>
                <span className="info-value">{selectedDepartment || "未选择"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">医生:</span>
                <span className="info-value">
                  {selectedDoctor
                    ? doctors.find((doc) => doc.id === selectedDoctor)?.name
                    : "未选择"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">疾病/症状:</span>
                <span className="info-value">
                  {selectedDisease
                    ? diseases.find((d) => d.id === selectedDisease)?.name
                    : "未选择"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">日期:</span>
                <span className="info-value">{selectedDate || "未选择"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">时间:</span>
                <span className="info-value">{selectedTime || "未选择"}</span>
              </div>
            </div>
          </div>

          {/* 选择按钮区域 */}
          <div className="selection-buttons">
            <button
              className={`selection-btn ${expandedSection === "department" ? "expanded" : ""} ${selectedDepartment ? "selected" : ""}`}
              onClick={() =>
                setExpandedSection(expandedSection === "department" ? null : "department")
              }
            >
              选择科室
              <span className="arrow">{expandedSection === "department" ? "▲" : "▼"}</span>
            </button>
            <button
              className={`selection-btn ${expandedSection === "doctor" ? "expanded" : ""} ${selectedDoctor ? "selected" : ""}`}
              onClick={() => setExpandedSection(expandedSection === "doctor" ? null : "doctor")}
              disabled={!selectedDepartment}
            >
              选择医生
              <span className="arrow">{expandedSection === "doctor" ? "▲" : "▼"}</span>
            </button>
            <button
              className={`selection-btn ${expandedSection === "date" ? "expanded" : ""} ${selectedDate ? "selected" : ""}`}
              onClick={() => setExpandedSection(expandedSection === "date" ? null : "date")}
              disabled={!selectedDoctor}
            >
              选择日期
              <span className="arrow">{expandedSection === "date" ? "▲" : "▼"}</span>
            </button>
            <button
              className={`selection-btn ${expandedSection === "time" ? "expanded" : ""} ${selectedTime ? "selected" : ""}`}
              onClick={() => setExpandedSection(expandedSection === "time" ? null : "time")}
              disabled={!selectedDate}
            >
              选择时间
              <span className="arrow">{expandedSection === "time" ? "▲" : "▼"}</span>
            </button>
          </div>

          {/* 选项展开区域 */}
          <div className="options-section">
            {expandedSection === "department" && (
              <div className="department-options">
                {departments.map((dept) => (
                  <div
                    key={dept}
                    className={`option-item ${selectedDepartment === dept ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setSelectedDoctor(null);
                      setSelectedDisease(null);
                      setSelectedDate("");
                      setSelectedTime(null);
                    }}
                  >
                    <div className="option-name">{dept}</div>
                    <div className="option-desc">常见疾病诊疗</div>
                  </div>
                ))}
              </div>
            )}

            {expandedSection === "doctor" && (
              <div className="doctor-options">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`option-item ${selectedDoctor === doctor.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      const disease = availableDiseases.find((d) => d.department === doctor.department);
                      setSelectedDisease(disease ? disease.id : null);
                      setSelectedDate("");
                      setSelectedTime(null);
                    }}
                  >
                    <div className="option-name">{doctor.name}</div>
                    <div className="option-desc">
                      {doctor.title || "主治医师"} | {doctor.department}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expandedSection === "date" && (
              <div className="date-options">
                <input
                  type="date"
                  className="date-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(null);
                  }}
                />
              </div>
            )}

            {expandedSection === "time" && (
              <div className="time-options">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`time-option-item ${selectedTime === time ? "selected" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!patient || !selectedDoctor || !selectedDisease || !selectedDate || !selectedTime}
          >
            确认挂号
          </button>
        </>
      )}
    </div>
  );
};

export default RegistrationPage;