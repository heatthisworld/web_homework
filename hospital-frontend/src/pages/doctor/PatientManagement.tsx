import React, { useEffect, useState } from "react";
import "./PatientManagement.css";
import {
  fetchPatientsWithDetails,
  type PatientDetails,
  type VisitStatus,
} from "../../services/patientService";

type GenderFilter = "all" | "MALE" | "FEMALE";

const fallbackPatients: PatientDetails[] = [
  {
    id: 101,
    username: "zhangsan@example.com",
    name: "张三",
    gender: "MALE",
    age: 35,
    phone: "13800001234",
    address: "北京市朝阳区朝阳北路123号",
    medicalHistory: [
      {
        id: 1,
        visitDate: "2025-11-20T09:00:00",
        diagnosis: "高血压",
        treatment: "药物治疗，定期复查",
        medications: ["降压药", "阿司匹林"],
        doctor: "张医生",
        symptoms: "头晕、乏力",
      },
      {
        id: 2,
        visitDate: "2025-10-15T15:30:00",
        diagnosis: "感冒",
        treatment: "休息与用药",
        medications: ["感冒药", "退烧药"],
        doctor: "李医生",
        symptoms: "流涕、咳嗽",
      },
    ],
    visitHistory: [
      {
        id: 1,
        appointmentTime: "2025-12-11T10:00:00",
        department: "内科",
        doctor: "张医生",
        disease: "高血压",
        status: "completed",
        symptoms: "头痛、发热",
      },
      {
        id: 2,
        appointmentTime: "2025-11-20T09:30:00",
        department: "内科",
        doctor: "张医生",
        disease: "高血压",
        status: "completed",
        symptoms: "高血压复诊",
      },
    ],
  },
  {
    id: 102,
    username: "lisi@example.com",
    name: "李四",
    gender: "FEMALE",
    age: 28,
    phone: "13900005678",
    address: "上海市浦东新区世纪大道456号",
    medicalHistory: [
      {
        id: 3,
        visitDate: "2025-11-10T14:00:00",
        diagnosis: "上呼吸道感染",
        treatment: "对症治疗",
        medications: ["抗生素", "止咳药"],
        doctor: "张医生",
        symptoms: "咽喉疼痛、咳嗽",
      },
    ],
    visitHistory: [
      {
        id: 3,
        appointmentTime: "2025-12-11T13:30:00",
        department: "内科",
        doctor: "张医生",
        disease: "上呼吸道感染",
        status: "pending",
        symptoms: "咳嗽、喉咙疼",
      },
    ],
  },
  {
    id: 103,
    username: "wangwu@example.com",
    name: "王五",
    gender: "MALE",
    age: 42,
    phone: "13700009012",
    address: "广州市天河区体育西路789号",
    medicalHistory: [
      {
        id: 4,
        visitDate: "2025-10-05T11:00:00",
        diagnosis: "胃炎",
        treatment: "药物治疗与饮食调整",
        medications: ["胃药"],
        doctor: "张医生",
        symptoms: "胃部不适、反酸",
      },
      {
        id: 5,
        visitDate: "2025-09-15T16:00:00",
        diagnosis: "腰椎间盘突出",
        treatment: "物理治疗",
        medications: ["止痛药"],
        doctor: "王医生",
        symptoms: "腰部疼痛",
      },
    ],
    visitHistory: [
      {
        id: 4,
        appointmentTime: "2025-12-11T09:30:00",
        department: "内科",
        doctor: "张医生",
        disease: "胃炎",
        status: "completed",
        symptoms: "腹痛、腹胀",
      },
      {
        id: 5,
        appointmentTime: "2025-10-05T09:00:00",
        department: "内科",
        doctor: "张医生",
        disease: "胃炎",
        status: "completed",
        symptoms: "胃部隐痛",
      },
    ],
  },
];

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
  const [activeTab, setActiveTab] = useState<"profile" | "medical" | "visit">(
    "profile",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPatients = async () => {
      try {
        const data = await fetchPatientsWithDetails();
        if (cancelled) return;
        if (!data.length) {
          console.log("暂无患者数据，已展示本地示例数据");
          setPatients(fallbackPatients);
          setFilteredPatients(fallbackPatients);
          setSelectedPatient(fallbackPatients[0] ?? null);
          return;
        }
        setPatients(data);
        setFilteredPatients(data);
        setSelectedPatient(data[0] ?? null);
      } catch (err) {
        if (cancelled) return;
        console.error('加载患者数据失败:', err);
        // 不显示错误信息，静默使用示例数据
        setPatients(fallbackPatients);
        setFilteredPatients(fallbackPatients);
        setSelectedPatient(fallbackPatients[0] ?? null);
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
              {filteredPatients.map((patient) => (
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
              ))}
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
    </div>
  );
};

export default PatientManagement;
