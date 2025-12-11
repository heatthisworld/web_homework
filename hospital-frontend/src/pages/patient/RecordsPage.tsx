import React, { useState } from 'react';
import './patient.css';

const RecordsPage: React.FC = () => {
  // 模拟数据
  const registrationRecords = [
    { id: 1, department: '内科', doctor: '张医生', date: '2024-01-15', time: '09:00', status: '已就诊', recordId: 'REG20240115001' },
    { id: 2, department: '儿科', doctor: '赵医生', date: '2024-01-20', time: '10:30', status: '待就诊', recordId: 'REG20240120002' },
    { id: 3, department: '外科', doctor: '王医生', date: '2023-12-28', time: '14:30', status: '已取消', recordId: 'REG20231228003' }
  ];

  const medicalRecords = [
    { id: 1, department: '内科', doctor: '张医生', date: '2024-01-15', diagnosis: '高血压', medications: ['降压药', '阿司匹林'] },
    { id: 2, department: '儿科', doctor: '赵医生', date: '2023-11-10', diagnosis: '上呼吸道感染', medications: ['退烧药', '抗生素'] },
    { id: 3, department: '外科', doctor: '王医生', date: '2023-10-05', diagnosis: '软组织损伤', medications: ['止痛药', '消炎药'] }
  ];

  // 状态管理
  const [activeTab, setActiveTab] = useState('registration');

  return (
    <div className="records-page patient-page">
      <h3>我的记录</h3>

      {/* 内部标签页 */}
      <div className="internal-tabs">
        <div 
          className={`internal-tab ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => setActiveTab('registration')}
        >
          挂号记录
        </div>
        <div 
          className={`internal-tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          病历记录
        </div>
      </div>

      {/* 挂号记录 */}
      {activeTab === 'registration' && (
        <div className="registration-records">
          {registrationRecords.map(record => (
            <div key={record.id} className="record-item">
              <div className="record-header">
                <div className="record-department">{record.department}</div>
                <div className={`record-status ${record.status.toLowerCase()}`}>
                  {record.status}
                </div>
              </div>
              <div className="record-content">
                <p><strong>医生:</strong> {record.doctor}</p>
                <p><strong>时间:</strong> {record.date} {record.time}</p>
                <p><strong>挂号ID:</strong> {record.recordId}</p>
              </div>
              {record.status === '待就诊' && (
                <button className="cancel-btn">取消挂号</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 病历记录 */}
      {activeTab === 'medical' && (
        <div className="medical-records">
          {medicalRecords.map(record => (
            <div key={record.id} className="record-item">
              <div className="record-header">
                <div className="record-department">{record.department}</div>
                <div className="record-date">{record.date}</div>
              </div>
              <div className="record-content">
                <p><strong>医生:</strong> {record.doctor}</p>
                <p><strong>诊断:</strong> {record.diagnosis}</p>
                <p><strong>用药:</strong> {record.medications.join(', ')}</p>
              </div>
              <button className="detail-btn">查看详情</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsPage;