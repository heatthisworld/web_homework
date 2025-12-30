import React, { useEffect, useMemo, useState } from "react";
import "./patient.css";
import {
  createRegistration,
  fetchCurrentPatientDetails,
  fetchDoctors,
  type DoctorSummary,
  type PatientDetails,
} from "../../services/patientService";

interface RegistrationPageProps {
  debugMode: boolean;
}

const mockDoctors: DoctorSummary[] = [
  { id: 1, name: "张医生", department: "内科", title: "主任医师", avatarUrl: "/files/Default.gif" },
  { id: 2, name: "李医生", department: "内科", title: "主治医师", avatarUrl: "/files/Default.gif" },
  { id: 3, name: "王医生", department: "儿科", title: "副主任医师", avatarUrl: "/files/Default.gif" },
];

const timeSlots = ["08:30", "09:00", "10:00", "14:00", "15:00", "16:00"];

const RegistrationPage: React.FC<RegistrationPageProps> = ({ debugMode }) => {
  const [doctors, setDoctors] = useState<DoctorSummary[]>(mockDoctors);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    doctors.forEach(d => {
      const deptName = typeof d.department === "string" ? d.department : (d as any).department?.name;
      if (deptName) deptSet.add(deptName);
    });
    return Array.from(deptSet);
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
        const [patientDetail, doctorList] = await Promise.all([
          fetchCurrentPatientDetails(),
          fetchDoctors(),
        ]);
        if (cancelled) return;
        setPatient(patientDetail);
        setDoctors(doctorList.length ? doctorList : mockDoctors);
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
    return doctors.filter((doc) => {
      const deptName = typeof doc.department === "string" ? doc.department : (doc as any).department?.name;
      return deptName === selectedDepartment;
    });
  }, [selectedDepartment, doctors]);

  const handleBookClick = (doctor: DoctorSummary) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSelectedTime("");
    setShowTimeModal(true);
  };

  const handleSubmit = async () => {
    if (!patient || !selectedDoctor || !selectedDate || !selectedTime) {
      setError("请完成所有选择");
      return;
    }

    if (debugMode) {
      setRegistrationSuccess(true);
      setShowTimeModal(false);
      setTimeout(() => setRegistrationSuccess(false), 3000);
      return;
    }

    try {
      const appointmentTime = `${selectedDate}T${selectedTime}:00`;
      await createRegistration({
        patientId: patient.id,
        doctorId: selectedDoctor.id,
        diseaseId: 1,
        appointmentTime,
      });
      setRegistrationSuccess(true);
      setShowTimeModal(false);
      setError("");

      setTimeout(() => {
        setRegistrationSuccess(false);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
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

      {registrationSuccess && (
        <div className="success-message">
          <h4>✅ 挂号成功！</h4>
          <p>您已成功挂号，请按时就诊。</p>
        </div>
      )}

      <div className="registration-layout">
        {/* 左侧科室导航 */}
        <div className="department-sidebar">
          <div className="sidebar-title">选择科室</div>
          <div
            className={`department-nav-item ${!selectedDepartment ? "active" : ""}`}
            onClick={() => setSelectedDepartment("")}
          >
            全部科室
          </div>
          {departments.map((dept) => (
            <div
              key={dept}
              className={`department-nav-item ${selectedDepartment === dept ? "active" : ""}`}
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept}
            </div>
          ))}
        </div>

        {/* 右侧医生列表 */}
        <div className="doctor-list-area">
          {filteredDoctors.length === 0 ? (
            <div className="no-doctors">该科室暂无医生</div>
          ) : (
            filteredDoctors.map((doctor) => {
              const avatarSrc =
                doctor.avatarUrl && doctor.avatarUrl.trim() !== ""
                  ? doctor.avatarUrl
                  : "/files/Default.gif";
              const deptName =
                typeof doctor.department === "string"
                  ? doctor.department
                  : (doctor as any).department?.name;
              return (
                <div key={doctor.id} className="doctor-card-horizontal">
                  <div className="doctor-avatar-large">
                    <img src={avatarSrc} alt={`${doctor.name}头像`} />
                  </div>
                  <div className="doctor-info-area">
                    <h4>{doctor.name}</h4>
                    <p className="doctor-title">{doctor.title}</p>
                    <p className="doctor-department">
                      {deptName}
                    </p>
                  </div>
                  <button className="book-button" onClick={() => handleBookClick(doctor)}>
                    预约挂号
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 时间选择弹窗 */}
      {showTimeModal && (
        <div className="modal-overlay" onClick={() => setShowTimeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>选择预约时间</h4>
              <button className="modal-close" onClick={() => setShowTimeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-doctor-info">
                <strong>{selectedDoctor?.name}</strong> - {selectedDoctor?.title}
              </div>
              <div className="time-select-group">
                <label>日期:</label>
                <input
                  type="date"
                  className="time-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="time-select-group">
                <label>时间:</label>
                <div className="time-slots-grid">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime}
              >
                确认挂号
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
