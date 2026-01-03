import React, { useState, useMemo } from "react";
import "./patient.css";
import { useDoctor } from "../../contexts/DoctorContext";

const DoctorsPage: React.FC = () => {
  const { doctors, loading, error } = useDoctor();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    doctors.forEach(d => {
      const deptName = typeof d.department === "string" ? d.department : (d.department as any)?.name;
      if (deptName) deptSet.add(deptName);
    });
    return Array.from(deptSet);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter((doctor) => {
        const deptName = typeof doctor.department === "string" ? doctor.department : (doctor.department as any)?.name;
        return deptName === selectedDepartment;
      });
    }

    return filtered;
  }, [searchTerm, selectedDepartment, doctors]);

  if (loading) {
    return (
      <div className="patient-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载医生列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <h3>医生查询</h3>
      {error && <div className="error-message">{error}</div>}

      <div className="search-box" style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="搜索医生姓名..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
            <div className="no-doctors">未找到符合条件的医生</div>
          ) : (
            filteredDoctors.map((doctor) => {
              const avatarSrc = doctor.avatarUrl && doctor.avatarUrl.trim() !== ""
                ? doctor.avatarUrl
                : "/files/Default.gif";
              const deptName = typeof doctor.department === "string"
                ? doctor.department
                : (doctor.department as any)?.name || "未知科室";

              return (
                <div key={doctor.id} className="doctor-card-horizontal">
                  <div className="doctor-avatar-large">
                    <img src={avatarSrc} alt={`${doctor.name}头像`} />
                  </div>
                  <div className="doctor-info-area">
                    <h4>{doctor.name}</h4>
                    <p className="doctor-title">{doctor.title || "医生"}</p>
                    <p className="doctor-department">{deptName}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
