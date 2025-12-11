import React, { useState } from 'react';
import './PatientManagement.css';

interface Patient {
  id: number;
  name: string;
  gender: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  medicalHistory: MedicalRecord[];
  visitHistory: VisitRecord[];
}

interface MedicalRecord {
  id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  doctor: string;
}

interface VisitRecord {
  id: number;
  date: string;
  department: string;
  doctor: string;
  status: 'completed' | 'pending' | 'cancelled';
  symptoms: string;
}

const PatientManagement: React.FC = () => {
  // 模拟数据
  const patients: Patient[] = [
    {
      id: 101,
      name: '张三',
      gender: '男',
      age: 35,
      phone: '138****1234',
      email: 'zhangsan@example.com',
      address: '北京市朝阳区某某街道123号',
      medicalHistory: [
        {
          id: 1,
          date: '2025-11-20',
          diagnosis: '高血压',
          treatment: '药物治疗',
          medications: ['降压药', '阿司匹林'],
          doctor: '张医生'
        },
        {
          id: 2,
          date: '2025-10-15',
          diagnosis: '感冒',
          treatment: '休息和药物治疗',
          medications: ['感冒药', '退烧药'],
          doctor: '李医生'
        }
      ],
      visitHistory: [
        {
          id: 1,
          date: '2025-12-11',
          department: '内科',
          doctor: '张医生',
          status: 'completed',
          symptoms: '头痛、发热'
        },
        {
          id: 2,
          date: '2025-11-20',
          department: '内科',
          doctor: '张医生',
          status: 'completed',
          symptoms: '高血压复诊'
        }
      ]
    },
    {
      id: 102,
      name: '李四',
      gender: '女',
      age: 28,
      phone: '139****5678',
      email: 'lisi@example.com',
      address: '上海市浦东新区某某路456号',
      medicalHistory: [
        {
          id: 3,
          date: '2025-11-10',
          diagnosis: '上呼吸道感染',
          treatment: '抗生素治疗',
          medications: ['抗生素', '止咳药'],
          doctor: '张医生'
        }
      ],
      visitHistory: [
        {
          id: 3,
          date: '2025-12-11',
          department: '内科',
          doctor: '张医生',
          status: 'pending',
          symptoms: '咳嗽、喉咙痛'
        }
      ]
    },
    {
      id: 103,
      name: '王五',
      gender: '男',
      age: 42,
      phone: '137****9012',
      email: 'wangwu@example.com',
      address: '广州市天河区某某大道789号',
      medicalHistory: [
        {
          id: 4,
          date: '2025-10-05',
          diagnosis: '胃炎',
          treatment: '药物治疗和饮食调整',
          medications: ['胃药'],
          doctor: '张医生'
        },
        {
          id: 5,
          date: '2025-09-15',
          diagnosis: '腰椎间盘突出',
          treatment: '物理治疗',
          medications: ['止痛药'],
          doctor: '王医生'
        }
      ],
      visitHistory: [
        {
          id: 4,
          date: '2025-12-11',
          department: '内科',
          doctor: '张医生',
          status: 'completed',
          symptoms: '腹痛、腹泻'
        },
        {
          id: 5,
          date: '2025-10-05',
          department: '内科',
          doctor: '张医生',
          status: 'completed',
          symptoms: '胃痛'
        }
      ]
    }
  ];

  // 状态管理
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'visit'>('profile');

  // 筛选患者
  const filterPatients = () => {
    let filtered = [...patients];

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.id.toString().includes(term) ||
        patient.phone.includes(term)
      );
    }

    // 按性别筛选
    if (selectedGender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === selectedGender);
    }

    setFilteredPatients(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterPatients();
  }, [searchTerm, selectedGender]);

  // 查看患者详情
  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('profile');
  };

  // 关闭患者详情
  const closePatientDetails = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="patient-management">
      <h1>患者管理</h1>
      
      {/* 筛选和搜索 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>性别：</label>
            <select 
              value={selectedGender} 
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <input 
              type="text" 
              placeholder="搜索患者姓名、ID或电话..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="patient-content">
        {/* 患者列表 */}
        <div className="patient-list-container">
          <div className="list-header">
            <h2>患者列表</h2>
            <span className="patient-count">共 {filteredPatients.length} 位患者</span>
          </div>
          
          <div className="patient-list">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                onClick={() => viewPatientDetails(patient)}
              >
                <div className="patient-avatar">
                  {patient.name.charAt(0)}
                </div>
                <div className="patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-basic">
                    {patient.gender} | {patient.age}岁 | ID: {patient.id}
                  </div>
                  <div className="patient-contact">
                    {patient.phone} | {patient.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 患者详情 */}
        {selectedPatient && (
          <div className="patient-details-container">
            <div className="details-header">
              <h2>患者详情</h2>
              <button className="close-btn" onClick={closePatientDetails}>×</button>
            </div>
            
            {/* 详情标签页 */}
            <div className="details-tabs">
              <button 
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                基本信息
              </button>
              <button 
                className={`tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
                onClick={() => setActiveTab('medical')}
              >
                病历记录
              </button>
              <button 
                className={`tab-btn ${activeTab === 'visit' ? 'active' : ''}`}
                onClick={() => setActiveTab('visit')}
              >
                就诊历史
              </button>
            </div>
            
            {/* 详情内容 */}
            <div className="details-content">
              {/* 基本信息 */}
              {activeTab === 'profile' && (
                <div className="profile-info">
                  <div className="info-section">
                    <h3>基本信息</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">患者ID：</span>
                        <span className="info-value">{selectedPatient.id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">姓名：</span>
                        <span className="info-value">{selectedPatient.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">性别：</span>
                        <span className="info-value">{selectedPatient.gender}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">年龄：</span>
                        <span className="info-value">{selectedPatient.age}岁</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">手机号码：</span>
                        <span className="info-value">{selectedPatient.phone}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">邮箱地址：</span>
                        <span className="info-value">{selectedPatient.email}</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">联系地址：</span>
                        <span className="info-value">{selectedPatient.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 病历记录 */}
              {activeTab === 'medical' && (
                <div className="medical-records">
                  <div className="section-header">
                    <h3>病历记录</h3>
                    <button className="add-btn">添加病历</button>
                  </div>
                  
                  <div className="records-list">
                    {selectedPatient.medicalHistory.length > 0 ? (
                      selectedPatient.medicalHistory.map(record => (
                        <div key={record.id} className="record-card">
                          <div className="record-header">
                            <div className="record-date">{record.date}</div>
                            <div className="record-doctor">{record.doctor}</div>
                          </div>
                          <div className="record-content">
                            <div className="record-diagnosis">
                              <strong>诊断：</strong>{record.diagnosis}
                            </div>
                            <div className="record-treatment">
                              <strong>治疗方案：</strong>{record.treatment}
                            </div>
                            <div className="record-medications">
                              <strong>用药：</strong>{record.medications.join('、')}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-records">暂无病历记录</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 就诊历史 */}
              {activeTab === 'visit' && (
                <div className="visit-history">
                  <h3>就诊历史</h3>
                  
                  <div className="history-list">
                    {selectedPatient.visitHistory.length > 0 ? (
                      selectedPatient.visitHistory.map(visit => (
                        <div key={visit.id} className="visit-card">
                          <div className="visit-header">
                            <div className="visit-date">{visit.date}</div>
                            <span className={`visit-status status-${visit.status}`}>
                              {visit.status === 'completed' ? '已完成' : 
                               visit.status === 'pending' ? '待就诊' : '已取消'}
                            </span>
                          </div>
                          <div className="visit-content">
                            <div className="visit-department">
                              <strong>科室：</strong>{visit.department}
                            </div>
                            <div className="visit-doctor">
                              <strong>医生：</strong>{visit.doctor}
                            </div>
                            <div className="visit-symptoms">
                              <strong>症状：</strong>{visit.symptoms}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-records">暂无就诊历史</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientManagement;
