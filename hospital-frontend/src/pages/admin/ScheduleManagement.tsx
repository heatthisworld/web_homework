import React, { useMemo, useState } from "react";

type ShiftStatus = "开放" | "进行中" | "满号" | "暂停";

interface Schedule {
  id: number;
  date: string;
  period: string;
  doctor: string;
  department: string;
  type: "普通号" | "专家号" | "加号";
  slots: string;
  status: ShiftStatus;
}

const ScheduleManagement: React.FC = () => {
  const mockSchedules: Schedule[] = [
    { id: 1, date: "2025-12-12", period: "09:00-12:00", doctor: "王磊", department: "内科", type: "普通号", slots: "12 / 18", status: "进行中" },
    { id: 2, date: "2025-12-12", period: "10:00-12:00", doctor: "林静", department: "儿科", type: "专家号", slots: "满号", status: "满号" },
    { id: 3, date: "2025-12-12", period: "14:00-17:00", doctor: "陈思", department: "外科", type: "加号", slots: "6 / 12", status: "开放" },
    { id: 4, date: "2025-12-13", period: "09:00-11:00", doctor: "李言", department: "眼科", type: "专家号", slots: "3 / 10", status: "开放" },
    { id: 5, date: "2025-12-13", period: "14:00-17:00", doctor: "张驰", department: "骨科", type: "普通号", slots: "7 / 15", status: "暂停" },
  ];

  const [department, setDepartment] = useState<string>("全部");
  const [status, setStatus] = useState<"全部" | ShiftStatus>("全部");
  const [date, setDate] = useState<string>("");

  const filtered = useMemo(() => {
    return mockSchedules.filter((item) => {
      const byDept = department === "全部" ? true : item.department === department;
      const byStatus = status === "全部" ? true : item.status === status;
      const byDate = date ? item.date === date : true;
      return byDept && byStatus && byDate;
    });
  }, [date, department, mockSchedules, status]);

  const statusTone = (value: ShiftStatus) => {
    if (value === "进行中") return "pill-success";
    if (value === "开放") return "pill-info";
    if (value === "满号") return "pill-warning";
    return "pill-danger";
  };

  const uniqueDepartments = Array.from(new Set(mockSchedules.map((s) => s.department)));

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">排班管理</h1>
          <p className="page-subtitle">按日期、科室、状态快速筛查医生档期，支持标签页独立查看。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            新建排班
          </button>
        </div>
      </div>

      <div className="surface-card">
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">日期</span>
            <input
              className="filter-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
            <span className="filter-label">状态</span>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="全部">全部</option>
              <option value="开放">开放</option>
              <option value="进行中">进行中</option>
              <option value="满号">满号</option>
              <option value="暂停">暂停</option>
            </select>
          </div>
          <span className="filter-chip">结果 {filtered.length} 条</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>时段</th>
              <th>医生 / 科室</th>
              <th>号源类型</th>
              <th>占用</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.period}</td>
                <td>
                  <div>{row.doctor}</div>
                  <div className="muted">{row.department}</div>
                </td>
                <td>{row.type}</td>
                <td>{row.slots}</td>
                <td>
                  <span className={`pill ${statusTone(row.status)}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManagement;
