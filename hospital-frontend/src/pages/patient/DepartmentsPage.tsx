import React, { useState, useEffect } from "react";
import "./patient.css";
import { fetchDoctors } from "../../services/patientService";

interface Department {
  name: string;
  doctorCount: number;
  description: string;
}

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const doctors = await fetchDoctors();
        const deptMap = new Map<string, number>();
        
        doctors.forEach(doctor => {
          deptMap.set(doctor.department, (deptMap.get(doctor.department) || 0) + 1);
        });
        
        const deptList: Department[] = Array.from(deptMap.entries()).map(([name, count]) => ({
          name,
          doctorCount: count,
          description: `${name}诊疗服务`
        }));
        
        setDepartments(deptList);
        setFilteredDepartments(deptList);
      } catch (error) {
        console.error("加载科室列表失败", error);
      } finally {
        setLoading(false);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredDepartments(
        departments.filter(dept =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredDepartments(departments);
    }
  }, [searchTerm, departments]);

  if (loading) {
    return (
      <div className="patient-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载科室列表...</p>
        </div>
      </div>
    );
  }

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