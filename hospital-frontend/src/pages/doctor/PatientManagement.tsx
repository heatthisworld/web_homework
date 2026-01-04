import React, { useEffect, useState } from "react";
import "./PatientManagement.css";
import {
  fetchPatientsWithDetails,
  type PatientDetails,
  type VisitStatus,
} from "../../services/patientService";

type GenderFilter = "all" | "MALE" | "FEMALE";



const genderLabel = (gender?: PatientDetails["gender"]) => {
  if (gender === "MALE") return "男";
  if (gender === "FEMALE") return "女";
  return "未知";
};

const statusLabel = (status: VisitStatus) => {
  switch (status) {
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return "待就诊";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return value.replace("T", " ");
};

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<PatientDetails[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("all");
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"profile" | "medical" | "visit">("profile");
  const [loading, setLoading] = useState(true);
  // 添加患者模态框相关状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<PatientDetails>>({
    name: '',
    gender: 'MALE',
    age: 0,
    phone: '',
    address: '',
    medicalHistory: [],
    visitHistory: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPatients = async () => {
      try {
        const data = await fetchPatientsWithDetails();
        if (cancelled) return;
        
        // 确保只在API返回有效数据时使用真实数据
        if (Array.isArray(data) && data.length > 0) {
          console.log("成功获取患者数据");
          setPatients(data);
          setFilteredPatients(data);
          setSelectedPatient(data[0] ?? null);
        } else {
          console.log("暂无患者数据");
          setPatients([]);
          setFilteredPatients([]);
          setSelectedPatient(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('加载患者数据失败:', err);
        setPatients([]);
        setFilteredPatients([]);
        setSelectedPatient(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let filtered = [...patients];
    const keyword = searchTerm.trim().toLowerCase();

    if (keyword) {
      filtered = filtered.filter((patient) => {
        const nameMatch = (patient.name || "").toLowerCase().includes(keyword);
        const idMatch = patient.id?.toString().includes(keyword);
        const phoneMatch = (patient.phone || "").includes(keyword);
        return nameMatch || idMatch || phoneMatch;
      });
    }

    if (selectedGender !== "all") {
      filtered = filtered.filter((patient) => patient.gender === selectedGender);
    }

    setFilteredPatients(filtered);

    if (
      selectedPatient &&
      !filtered.some((patient) => patient.id === selectedPatient.id)
    ) {
      setSelectedPatient(filtered[0] ?? null);
    }
  }, [searchTerm, selectedGender, patients, selectedPatient]);

  const viewPatientDetails = (patient: PatientDetails) => {
    setSelectedPatient(patient);
    setActiveTab("profile");
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
  };

  // 打开添加患者模态框
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // 关闭添加患者模态框
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    // 重置表单
    setNewPatient({
      name: '',
      gender: 'MALE',
      age: 0,
      phone: '',
      address: '',
      medicalHistory: [],
      visitHistory: []
    });
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // 保存新患者（模拟）
  const handleSavePatient = async () => {
    if (!newPatient.name || !newPatient.phone) {
      alert('请填写患者姓名和手机号');
      return;
    }

    setSaving(true);
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 生成唯一ID（模拟数据库自动生成）
      const newId = Math.max(...patients.map(p => p.id || 0), 0) + 1;
      
      // 创建新患者对象
      const patientToAdd: PatientDetails = {
        id: newId,
        name: newPatient.name,
        gender: newPatient.gender as 'MALE' | 'FEMALE',
        age: newPatient.age,
        phone: newPatient.phone,
        address: newPatient.address,
        medicalHistory: [],
        visitHistory: []
      };

      // 更新患者列表
      const updatedPatients = [...patients, patientToAdd];
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      
      // 选择新添加的患者
      setSelectedPatient(patientToAdd);
      
      // 关闭模态框
      closeAddModal();
      
      alert('患者添加成功');
    } catch (error) {
      console.error('添加患者失败:', error);
      alert('添加患者失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="patient-management">
      <h1>患者管理</h1>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>性别：</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as GenderFilter)}
            >
              <option value="all">全部</option>
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
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

      {loading ? (
        <div className="patient-content">
          <div className="loading">正在加载患者数据...</div>
        </div>
      ) : (
        <div className="patient-content">
          <div className="patient-list-container">
            <div className="list-header">
              <h2>患者列表</h2>
              <span className="patient-count">共 {filteredPatients.length} 位</span>
            </div>

            <div className="patient-list">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`patient-item ${
                    selectedPatient?.id === patient.id ? "active" : ""
                  }`}
                  onClick={() => viewPatientDetails(patient)}
                >
                  <div className="patient-avatar">
                    {(patient.name || "").charAt(0)}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-basic">
                      {genderLabel(patient.gender)} | {patient.age ?? "-"}岁 | ID:{" "}
                      {patient.id}
                    </div>
                    <div className="patient-contact">
                      {patient.phone || "-"} | {patient.username || "-"}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="empty-state-container">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-text">
                    <h3>暂无患者数据</h3>
                    <p>当前没有任何患者记录，请添加新患者或导入数据</p>
                  </div>
                  <div className="empty-state-actions">
                    <button className="empty-state-btn primary" onClick={openAddModal}>添加患者</button>
                    <button className="empty-state-btn secondary">导入数据</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedPatient && (
            <div className="patient-details-container">
              <div className="details-header">
                <h2>患者详情</h2>
                <button className="close-btn" onClick={closePatientDetails}>
                  ×
                </button>
              </div>

              <div className="details-tabs">
                <button
                  className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  基本信息
                </button>
                <button
                  className={`tab-btn ${activeTab === "medical" ? "active" : ""}`}
                  onClick={() => setActiveTab("medical")}
                >
                  病历记录
                </button>
                <button
                  className={`tab-btn ${activeTab === "visit" ? "active" : ""}`}
                  onClick={() => setActiveTab("visit")}
                >
                  就诊历史
                </button>
              </div>

              <div className="details-content">
                {activeTab === "profile" && (
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
                          <span className="info-value">
                            {genderLabel(selectedPatient.gender)}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">年龄：</span>
                          <span className="info-value">
                            {selectedPatient.age ?? "-"}岁
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">手机号：</span>
                          <span className="info-value">
                            {selectedPatient.phone || "-"}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">账号/邮箱：</span>
                          <span className="info-value">
                            {selectedPatient.username || "-"}
                          </span>
                        </div>
                        <div className="info-item full-width">
                          <span className="info-label">联系地址：</span>
                          <span className="info-value">
                            {selectedPatient.address || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "medical" && (
                  <div className="medical-records">
                    <div className="section-header">
                      <h3>病历记录</h3>
                    </div>

                    <div className="records-list">
                      {selectedPatient.medicalHistory?.length ? (
                        selectedPatient.medicalHistory.map((record) => (
                          <div key={record.id} className="record-card">
                            <div className="record-header">
                              <div className="record-date">
                                {formatDate(record.visitDate)}
                              </div>
                              <div className="record-doctor">
                                {record.doctor || "未记录"}
                              </div>
                            </div>
                            <div className="record-content">
                              <div className="record-diagnosis">
                                <strong>诊断：</strong>
                                {record.diagnosis || "-"}
                              </div>
                              <div className="record-treatment">
                                <strong>治疗方案：</strong>
                                {record.treatment || "-"}
                              </div>
                              <div className="record-medications">
                                <strong>用药：</strong>
                                {record.medications?.length
                                  ? record.medications.join("、")
                                  : "未记录"}
                              </div>
                              {record.symptoms && (
                                <div className="record-medications">
                                  <strong>症状：</strong>
                                  {record.symptoms}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-records">暂无病历记录</div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "visit" && (
                  <div className="visit-history">
                    <h3>就诊历史</h3>

                    <div className="history-list">
                      {selectedPatient.visitHistory?.length ? (
                        selectedPatient.visitHistory.map((visit) => (
                          <div key={visit.id} className="visit-card">
                            <div className="visit-header">
                              <div className="visit-date">
                                {formatDate(visit.appointmentTime)}
                              </div>
                              <span
                                className={`visit-status status-${visit.status}`}
                              >
                                {statusLabel(visit.status)}
                              </span>
                            </div>
                            <div className="visit-content">
                              <div className="visit-department">
                                <strong>科室：</strong>
                                {visit.department || "-"}
                              </div>
                              <div className="visit-doctor">
                                <strong>医生：</strong>
                                {visit.doctor || "-"}
                              </div>
                              <div className="visit-doctor">
                                <strong>疾病：</strong>
                                {visit.disease || "-"}
                              </div>
                              <div className="visit-symptoms">
                                <strong>症状：</strong>
                                {visit.symptoms || "-"}
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
      )}

      {/* 添加患者模态框 */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>添加新患者</h2>
              <button className="close-btn" onClick={closeAddModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  name="name"
                  value={newPatient.name || ''}
                  onChange={handleInputChange}
                  placeholder="请输入患者姓名"
                  required
                />
              </div>
              <div className="form-group">
                <label>性别</label>
                <select
                  name="gender"
                  value={newPatient.gender || 'MALE'}
                  onChange={handleInputChange}
                >
                  <option value="MALE">男</option>
                  <option value="FEMALE">女</option>
                </select>
              </div>
              <div className="form-group">
                <label>年龄</label>
                <input
                  type="number"
                  name="age"
                  value={newPatient.age || 0}
                  onChange={handleInputChange}
                  placeholder="请输入患者年龄"
                  min="0"
                  max="150"
                />
              </div>
              <div className="form-group">
                <label>手机号</label>
                <input
                  type="text"
                  name="phone"
                  value={newPatient.phone || ''}
                  onChange={handleInputChange}
                  placeholder="请输入患者手机号"
                  required
                />
              </div>
              <div className="form-group">
                <label>地址</label>
                <textarea
                  name="address"
                  value={newPatient.address || ''}
                  onChange={handleInputChange}
                  placeholder="请输入患者联系地址"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeAddModal}>取消</button>
              <button className="btn primary" onClick={handleSavePatient} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
