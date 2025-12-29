import React, { useMemo, useState } from "react";
import "./patient.css";
import {
  createRegistration,
} from "../../services/patientService";
import { usePatientData } from "./PatientApp";

interface RegistrationPageProps {
  debugMode: boolean;
}

interface DoctorSummary {
  id: number;
  name: string;
  department: string | { name: string };
  title?: string;
  avatarUrl?: string;
}

const timeSlots = ["08:30", "09:00", "10:00", "14:00", "15:00", "16:00"];

// 配置：可选择的未来天数
const FUTURE_DAYS_LIMIT = 7;

const RegistrationPage: React.FC<RegistrationPageProps> = ({ debugMode }) => {
  const { doctors, patient, refresh } = usePatientData();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState("");

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    doctors.forEach(d => {
      const deptName = typeof d.department === "string" ? d.department : d.department?.name;
      if (deptName) deptSet.add(deptName);
    });
    return Array.from(deptSet);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedDepartment) return doctors;
    return doctors.filter((doc) => {
      const deptName = typeof doc.department === "string" ? doc.department : doc.department?.name;
      return deptName === selectedDepartment;
    });
  }, [selectedDepartment, doctors]);

  // 生成可选日期列表
  const availableDates = useMemo(() => {
    const dates: { value: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= FUTURE_DAYS_LIMIT; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekday = weekdays[date.getDay()];

      const month = date.getMonth() + 1;
      const day = date.getDate();
      const label = i === 0 ? `今天 ${month}月${day}日 ${weekday}` : `${month}月${day}日 ${weekday}`;

      dates.push({ value: dateStr, label });
    }

    return dates;
  }, []);

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

      await refresh();

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
                  : doctor.department?.name;
              return (
                <div key={doctor.id} className="doctor-card-horizontal">
                  <div className="doctor-avatar-large">
                    <img src={avatarSrc} alt={`${doctor.name}头像`} />
                  </div>
                  <div className="doctor-info-area">
                    <h4>{doctor.name}</h4>
                    <p className="doctor-title">{doctor.title}</p>
                    <p className="doctor-department">{deptName}</p>
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
                <div className="date-hint">仅可选择未来{FUTURE_DAYS_LIMIT}天内</div>
                <select
                  className="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">请选择日期</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
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
