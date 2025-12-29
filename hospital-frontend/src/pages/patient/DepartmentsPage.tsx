import React, { useState, useMemo } from "react";
import "./patient.css";
import { usePatientData } from "./PatientApp";

const DepartmentsPage: React.FC = () => {
  const { doctors } = usePatientData();
  const [searchTerm, setSearchTerm] = useState("");

  const departments = useMemo(() => {
    const deptMap = new Map<string, number>();
    doctors.forEach(doctor => {
      // 处理 department 字段，可能是字符串或对象
      let deptName: string;
      if (typeof doctor.department === "string") {
        deptName = doctor.department;
      } else if (doctor.department && typeof doctor.department === "object") {
        deptName = (doctor.department as any).name || "未知科室";
      } else {
        deptName = "未知科室";
      }
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
    });

    return Array.from(deptMap.entries()).map(([name, count]) => ({
      name,
      doctorCount: count,
      description: `${name}诊疗服务`
    }));
  }, [doctors]);

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, departments]);

  return (
    <div className="patient-page">
      <h3>科室查询</h3>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索科室名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="department-list">
        {filteredDepartments.map((dept) => (
          <div key={dept.name} className="department-card">
            <div className="department-icon">🏥</div>
            <div className="department-info">
              <h4>{dept.name}</h4>
              <p>{dept.description}</p>
              <span className="doctor-count">{dept.doctorCount} 位医生</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentsPage;