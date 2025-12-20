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

type DepartmentOption = { id: number; name: string };

const mockDepartments: DepartmentOption[] = [
  { id: 1, name: "内科" },
  { id: 2, name: "外科" },
  { id: 3, name: "儿科" },
  { id: 4, name: "妇产科" },
  { id: 5, name: "眼科" },
];

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
  const [departments, setDepartments] = useState<DepartmentOption[]>(mockDepartments);
  const [doctors, setDoctors] = useState<DoctorSummary[]>(mockDoctors);
  const [diseases, setDiseases] = useState<Disease[]>(mockDiseases);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"department" | "doctor" | "time" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        setDoctors(doctorList);
        setDiseases(diseaseList);
        const deps = Array.from(new Set(doctorList.map((d) => d.department))).map(
          (name, index) => ({ id: index + 1, name }),
        );
        setDepartments(deps.length ? deps : mockDepartments);
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
        setDepartments(mockDepartments);
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
    const deptName = departments.find((d) => d.id === selectedDepartment)?.name;
    if (!deptName) return doctors;
    return doctors.filter((doc) => doc.department === deptName);
  }, [selectedDepartment, doctors, departments]);

  const availableDiseases = useMemo(() => {
    if (!selectedDepartment) return diseases;
    const deptName = departments.find((d) => d.id === selectedDepartment)?.name;
    if (!deptName) return diseases;
    return diseases.filter((d) => d.department === deptName);
  }, [selectedDepartment, diseases, departments]);

  const handleSubmit = async () => {
    if (!patient || selectedDoctor === null || selectedDisease === null || !selectedTime) return;
    if (debugMode) {
      setRegistrationSuccess(true);
      setTimeout(() => setRegistrationSuccess(false), 1500);
      return;
    }
    try {
      const today = new Date();
      const appointmentTime = `${today.toISOString().split("T")[0]}T${selectedTime}:00`;
      await createRegistration({
        patientId: patient.id,
        doctorId: selectedDoctor,
        diseaseId: selectedDisease,
        appointmentTime,
      });
      setRegistrationSuccess(true);
      setTimeout(() => setRegistrationSuccess(false), 1500);
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
                <span className="info-value">
                  {selectedDepartment
                    ? departments.find((dept) => dept.id === selectedDepartment)?.name
                    : "未选择"}
                </span>
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
              className={`selection-btn ${expandedSection === "time" ? "expanded" : ""} ${selectedTime ? "selected" : ""}`}
              onClick={() => setExpandedSection(expandedSection === "time" ? null : "time")}
              disabled={!selectedDoctor}
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
                    key={dept.id}
                    className={`option-item ${selectedDepartment === dept.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setSelectedDoctor(null);
                      setSelectedDisease(null);
                      setSelectedTime(null);
                    }}
                  >
                    <div className="option-name">{dept.name}</div>
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
            disabled={!patient || !selectedDoctor || !selectedDisease || !selectedTime}
          >
            确认挂号
          </button>
        </>
      )}
    </div>
  );
};

export default RegistrationPage;
