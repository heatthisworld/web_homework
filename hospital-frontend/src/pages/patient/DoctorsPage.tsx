import React, { useMemo, useState } from "react";
import "./patient.css";
import { usePatientData } from "./PatientApp";
import type { DoctorSummary } from "../../services/patientService";

const DoctorsPage: React.FC = () => {
  const { doctors } = usePatientData();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    doctors.forEach(doctor => {
      let deptName: string;
      if (typeof doctor.department === "string") {
        deptName = doctor.department;
      } else if (doctor.department && typeof doctor.department === "object") {
        deptName = (doctor.department as any).name || "未知科室";
      } else {
        deptName = "未知科室";
      }
      deptSet.add(deptName);
    });
    return Array.from(deptSet);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;

    if (selectedDepartment) {
      filtered = filtered.filter((doctor) => {
        let deptName: string;
        if (typeof doctor.department === "string") {
          deptName = doctor.department;
        } else if (doctor.department && typeof doctor.department === "object") {
          deptName = (doctor.department as any).name || "未知科室";
        } else {
          deptName = "未知科室";
        }
        return deptName === selectedDepartment;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [selectedDepartment, searchTerm, doctors]);

  return (
    <div className="registration-page">
      <h3>医生查询</h3>

      <div className="search-box" style={{ marginBottom: "15px" }}>
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
            <div className="no-doctors">该科室暂无医生</div>
          ) : (
            filteredDoctors.map((doctor) => {
              const avatarSrc =
                doctor.avatarUrl && doctor.avatarUrl.trim() !== ""
                  ? doctor.avatarUrl
                  : "/files/Default.gif";
              let deptName: string;
              if (typeof doctor.department === "string") {
                deptName = doctor.department;
              } else if (doctor.department && typeof doctor.department === "object") {
                deptName = (doctor.department as any).name || "未知科室";
              } else {
                deptName = "未知科室";
              }
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
