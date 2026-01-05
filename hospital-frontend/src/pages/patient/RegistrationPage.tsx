import React, { useMemo, useState, useEffect } from "react";
import "./patient.css";
import { createRegistration } from "../../services/patientService";
import { usePatient } from "../../contexts/PatientContext";
import { useDoctor } from "../../contexts/DoctorContext";

const timeSlots = ["08:30", "09:00", "10:00", "14:00", "15:00", "16:00"];

// Toast 提示组件
interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose, duration = 3000 }) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className={`toast toast-${type} ${isHiding ? 'hiding' : ''}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
};

const RegistrationPage: React.FC = () => {
  const { patient, loading: patientLoading, refreshPatient } = usePatient();
  const { doctors, loading: doctorsLoading, error: doctorsError } = useDoctor();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [departmentsCollapsed, setDepartmentsCollapsed] = useState(false);

  // Toast 状态
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ type, title, message });
  };

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    doctors.forEach(d => {
      const deptName = typeof d.department === "string" ? d.department : (d as any).department?.name;
      if (deptName) deptSet.add(deptName);
    });
    return Array.from(deptSet);
  }, [doctors]);

  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const weekday = weekdays[date.getDay()];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      let label = '';
      if (i === 0) label = '今天';
      else if (i === 1) label = '明天';
      else if (i === 2) label = '后天';
      else label = `${date.getMonth() + 1}月${date.getDate()}日`;

      options.push({
        value: dateStr,
        label: `${label} (${weekday})`,
        isWeekend,
        shortLabel: label
      });
    }

    return options;
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!selectedDepartment) return doctors;
    return doctors.filter((doc) => {
      const deptName = typeof doc.department === "string" ? doc.department : (doc as any).department?.name;
      return deptName === selectedDepartment;
    });
  }, [selectedDepartment, doctors]);

  const handleBookClick = (doctor: any) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSelectedTime("");
    setModalError("");
    setShowTimeModal(true);
  };

  const handleQuickDateSelect = (dateValue: string) => {
    setSelectedDate(dateValue);
    setModalError("");
  };

  const handleModalClose = () => {
    setShowTimeModal(false);
    setModalError("");
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleSubmit = async () => {
    if (!patient || !selectedDoctor || !selectedDate || !selectedTime) {
      setModalError("请完成所有选择");
      return;
    }

    try {
      const appointmentTime = `${selectedDate}T${selectedTime}:00`;
      // 修改：移除 diseaseId 参数
      await createRegistration({
        patientId: patient.id,
        doctorId: selectedDoctor.id,
        appointmentTime,
      });

      await refreshPatient();

      // 关闭模态框并显示成功提示
      setShowTimeModal(false);
      setModalError("");
      showToast('success', '挂号成功', `您已成功预约 ${selectedDoctor.name} 医生，请按时就诊`);

      // 重置状态
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "提交挂号失败";
      setModalError(errorMessage);
    }
  };

  if (patientLoading || doctorsLoading) {
    return (
      <div className="registration-page">
        <div className="announcement-item">正在加载，请稍候...</div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <h3>在线挂号</h3>
      {doctorsError && <div className="error-message">{doctorsError}</div>}

      {/* Toast 提示 */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="registration-layout">
        <div className="department-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">选择科室</div>
            <button
              className="collapse-btn"
              onClick={() => setDepartmentsCollapsed((prev) => !prev)}
            >
              {departmentsCollapsed ? "展开" : "收起"}
            </button>
          </div>

          {departmentsCollapsed ? (
            <div className="department-collapsed-tip">
              {selectedDepartment ? `当前：${selectedDepartment}` : "当前：全部科室"}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="doctor-list-area">
          {filteredDoctors.length === 0 ? (
            <div className="no-doctors">该科室暂无医生</div>
          ) : (
            filteredDoctors.map((doctor) => {
              const avatarSrc = doctor.avatarUrl && doctor.avatarUrl.trim() !== "" ? doctor.avatarUrl : "/files/Default.gif";
              const deptName = typeof doctor.department === "string" ? doctor.department : (doctor as any).department?.name;
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

      {showTimeModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>选择预约时间</h4>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-doctor-info">
                <strong>{selectedDoctor?.name}</strong> - {selectedDoctor?.title}
              </div>

              {modalError && (
                <div className="error-message" style={{ marginBottom: '15px' }}>
                  {modalError}
                </div>
              )}

              <div className="time-select-group">
                <label>快捷选择日期</label>
                <div className="quick-date-buttons">
                  {dateOptions.slice(0, 3).map((option) => (
                    <button
                      key={option.value}
                      className={`quick-date-btn ${selectedDate === option.value ? 'active' : ''}`}
                      onClick={() => handleQuickDateSelect(option.value)}
                    >
                      {option.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-select-group">
                <label>选择日期</label>
                <select
                  className="time-input date-select"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setModalError("");
                  }}
                >
                  <option value="">请选择日期</option>
                  {dateOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className={option.isWeekend ? 'weekend-option' : ''}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="time-select-group">
                <label>选择时间</label>
                <div className="time-slots-grid">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedTime(time);
                        setModalError("");
                      }}
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
