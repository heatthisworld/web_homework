import React, { useState } from 'react';
import './patient.css';

const RegistrationPage: React.FC = () => {
  // 模拟数据
  const departments = [
    { id: 1, name: '内科', description: '治疗消化系统、呼吸系统等疾病' },
    { id: 2, name: '外科', description: '治疗创伤、感染等外科疾病' },
    { id: 3, name: '儿科', description: '儿童疾病预防与治疗' },
    { id: 4, name: '妇科', description: '女性生殖系统疾病' },
    { id: 5, name: '眼科', description: '眼睛及视觉系统疾病' }
  ];

  const doctors = [
    { id: 1, name: '张医生', title: '主任医师', departmentId: 1, specialty: '心血管疾病', availableTimes: ['09:00', '10:00', '14:00'] },
    { id: 2, name: '李医生', title: '副主任医师', departmentId: 1, specialty: '消化系统', availableTimes: ['09:30', '11:00', '15:00'] },
    { id: 3, name: '王医生', title: '主任医师', departmentId: 2, specialty: '骨科', availableTimes: ['10:00', '14:30', '16:00'] },
    { id: 4, name: '赵医生', title: '主治医师', departmentId: 3, specialty: '儿童呼吸系统', availableTimes: ['08:30', '10:30', '15:30'] }
  ];

  // 状态管理
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'department' | 'doctor' | 'time' | null>(null);

  // 筛选当前科室的医生
  const filteredDoctors = selectedDepartment 
    ? doctors.filter(doctor => doctor.departmentId === selectedDepartment)
    : [];

  // 获取当前医生的可用时间
  const availableTimes = selectedDoctor 
    ? doctors.find(doctor => doctor.id === selectedDoctor)?.availableTimes || []
    : [];

  // 提交挂号
  const handleSubmit = () => {
    if (selectedDepartment && selectedDoctor && selectedTime) {
      setRegistrationSuccess(true);
      // 模拟成功后重置表单
      setTimeout(() => {
        setRegistrationSuccess(false);
        setSelectedDepartment(null);
        setSelectedDoctor(null);
        setSelectedTime(null);
      }, 2000);
    }
  };

  return (
    <div className="registration-page">
      <h3>在线挂号</h3>
      
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
                    ? departments.find(dept => dept.id === selectedDepartment)?.name 
                    : '未选择'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">医生:</span>
                <span className="info-value">
                  {selectedDoctor 
                    ? doctors.find(doctor => doctor.id === selectedDoctor)?.name 
                    : '未选择'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">时间:</span>
                <span className="info-value">{selectedTime || '未选择'}</span>
              </div>
            </div>
          </div>

          {/* 选择按钮区域 */}
          <div className="selection-buttons">
            <button 
              className={`selection-btn ${expandedSection === 'department' ? 'expanded' : ''} ${selectedDepartment ? 'selected' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'department' ? null : 'department')}
            >
              选择科室
              <span className="arrow">{expandedSection === 'department' ? '▼' : '▶'}</span>
            </button>
            <button 
              className={`selection-btn ${expandedSection === 'doctor' ? 'expanded' : ''} ${selectedDoctor ? 'selected' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'doctor' ? null : 'doctor')}
              disabled={!selectedDepartment}
            >
              选择医生
              <span className="arrow">{expandedSection === 'doctor' ? '▼' : '▶'}</span>
            </button>
            <button 
              className={`selection-btn ${expandedSection === 'time' ? 'expanded' : ''} ${selectedTime ? 'selected' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
              disabled={!selectedDoctor}
            >
              选择时间
              <span className="arrow">{expandedSection === 'time' ? '▼' : '▶'}</span>
            </button>
          </div>

          {/* 选项展开区域 */}
          <div className="options-section">
            {/* 科室选择选项 */}
            {expandedSection === 'department' && (
              <div className="department-options">
                {departments.map(dept => (
                  <div 
                    key={dept.id}
                    className={`option-item ${selectedDepartment === dept.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      // 重置后续选择
                      setSelectedDoctor(null);
                      setSelectedTime(null);
                    }}
                  >
                    <div className="option-name">{dept.name}</div>
                    <div className="option-desc">{dept.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 医生选择选项 */}
            {expandedSection === 'doctor' && (
              <div className="doctor-options">
                {filteredDoctors.map(doctor => (
                  <div 
                    key={doctor.id}
                    className={`option-item ${selectedDoctor === doctor.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      // 重置时间选择
                      setSelectedTime(null);
                    }}
                  >
                    <div className="option-name">{doctor.name}</div>
                    <div className="option-desc">{doctor.title} | 专长: {doctor.specialty}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 时间选择选项 */}
            {expandedSection === 'time' && (
              <div className="time-options">
                {availableTimes.map(time => (
                  <div 
                    key={time}
                    className={`time-option-item ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 提交按钮 - 始终可见 */}
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={!selectedDepartment || !selectedDoctor || !selectedTime}
          >
            确认挂号
          </button>
        </>
      )}
    </div>
  );
};

export default RegistrationPage;