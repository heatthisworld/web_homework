import React, { useMemo, useState } from "react";

type RegStatus = "待确认" | "已确认" | "已完成" | "已取消";

interface Registration {
  id: number;
  patient: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  channel: "线上" | "线下";
  type: "普通号" | "专家号";
  status: RegStatus;
  notes: string;
}

const RegistrationManagement: React.FC = () => {
  const registrations: Registration[] = [
    { id: 1, patient: "张三", department: "内科", doctor: "王磊", date: "2025-12-12", time: "09:00", channel: "线上", type: "普通号", status: "已完成", notes: "头痛复诊" },
    { id: 2, patient: "李四", department: "儿科", doctor: "林静", date: "2025-12-12", time: "10:00", channel: "线上", type: "专家号", status: "已确认", notes: "疫苗咨询" },
    { id: 3, patient: "王五", department: "外科", doctor: "陈思", date: "2025-12-12", time: "14:00", channel: "线下", type: "普通号", status: "待确认", notes: "术后复查" },
    { id: 4, patient: "赵六", department: "眼科", doctor: "李言", date: "2025-12-13", time: "09:30", channel: "线上", type: "专家号", status: "待确认", notes: "视力下降" },
    { id: 5, patient: "孙八", department: "骨科", doctor: "张驰", date: "2025-12-13", time: "14:30", channel: "线上", type: "普通号", status: "已取消", notes: "影像检查改期" },
  ];

  const [status, setStatus] = useState<"全部" | RegStatus>("全部");
  const [department, setDepartment] = useState<string>("全部");
  const [keyword, setKeyword] = useState<string>("");

  const filtered = useMemo(() => {
    return registrations.filter((item) => {
      const byStatus = status === "全部" ? true : item.status === status;
      const byDept = department === "全部" ? true : item.department === department;
      const byKeyword = keyword
        ? [item.patient, item.doctor, item.notes].join(" ").toLowerCase().includes(keyword.toLowerCase())
        : true;
      return byStatus && byDept && byKeyword;
    });
  }, [department, keyword, registrations, status]);

  const statusTone = (value: RegStatus) => {
    if (value === "已完成") return "pill-success";
    if (value === "已确认") return "pill-info";
    if (value === "待确认") return "pill-warning";
    return "pill-danger";
  };

  const uniqueDepartments = Array.from(new Set(registrations.map((item) => item.department)));

  const stats = useMemo(() => {
    const pending = registrations.filter((r) => r.status === "待确认").length;
    const confirmed = registrations.filter((r) => r.status === "已确认").length;
    const finished = registrations.filter((r) => r.status === "已完成").length;
    return { pending, confirmed, finished };
  }, [registrations]);

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">挂号管理</h1>
          <p className="page-subtitle">与排班、科室联动的挂号视图，状态一目了然。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            批量确认
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-meta">
            <div className="stat-label">待确认</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-trend warning">含专家号</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-meta">
            <div className="stat-label">已确认</div>
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-trend up">即时提醒已推送</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏁</div>
          <div className="stat-meta">
            <div className="stat-label">已完成</div>
            <div className="stat-value">{stats.finished}</div>
            <div className="stat-trend up">按时完成率 94%</div>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">挂号列表</h3>
          <span className="badge">与标签页联动</span>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">状态</span>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="全部">全部</option>
              <option value="待确认">待确认</option>
              <option value="已确认">已确认</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">科室</span>
            <select
              className="filter-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="全部">全部</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">搜索</span>
            <input
              className="filter-input"
              placeholder="患者 / 医生 / 备注"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <span className="filter-chip">结果 {filtered.length}</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>患者</th>
              <th>科室 / 医生</th>
              <th>日期</th>
              <th>时间</th>
              <th>渠道</th>
              <th>类型</th>
              <th>状态</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.patient}</td>
                <td>
                  <div>{row.department}</div>
                  <div className="muted">{row.doctor}</div>
                </td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>{row.channel}</td>
                <td>{row.type}</td>
                <td>
                  <span className={`pill ${statusTone(row.status)}`}>{row.status}</span>
                </td>
                <td>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationManagement;
