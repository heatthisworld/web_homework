import React, { useState, useEffect } from "react";
import "./patient.css";
import { fetchDoctors, type DoctorSummary } from "../../services/patientService";

const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error("加载医生列表失败", error);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(doctor =>
        doctor.department === selectedDepartment
      );
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedDepartment, doctors]);

  const departments = [...new Set(doctors.map(d => d.department))];

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
    <div className="patient-page">
      <h3>医生查询</h3>
      
      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索医生姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="department-filter"
        >
          <option value="">全部科室</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="doctor-list">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-avatar">👨‍⚕️</div>
            <div className="doctor-info">
              <h4>{doctor.name}</h4>
              <p className="doctor-title">{doctor.title || "医师"}</p>
              <p className="doctor-department">{doctor.department}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsPage;