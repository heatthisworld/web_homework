import React, { useEffect, useMemo, useState } from "react";
import { fetchSchedules } from "../../services/adminService";
import type { AdminSchedule } from "../../services/adminService";

type ShiftStatus = "OPEN" | "RUNNING" | "FULL" | "PAUSED";

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [department, setDepartment] = useState<string>("全部");
  const [status, setStatus] = useState<"全部" | ShiftStatus>("全部");
  const [date, setDate] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSchedules();
        setSchedules(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(schedules.map((s) => s.department?.name ?? "未分配"))),
    [schedules]
  );

  const filtered = useMemo(() => {
    return schedules.filter((item) => {
      const byDept = department === "全部" ? true : (item.department?.name ?? "未分配") === department;
      const byStatus = status === "全部" ? true : item.status === status;
      const byDate = date ? item.workDate === date : true;
      const byKeyword = keyword
        ? [item.doctor?.name ?? "", item.department?.name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byDept && byStatus && byDate && byKeyword;
    });
  }, [date, department, schedules, status, keyword]);

  const statusTone = (value: ShiftStatus) => {
    if (value === "RUNNING") return "pill-success";
    if (value === "OPEN") return "pill-info";
    if (value === "FULL") return "pill-warning";
    return "pill-danger";
  };

  const statusText = (value: ShiftStatus) =>
    value === "RUNNING" ? "进行中" : value === "OPEN" ? "开放" : value === "FULL" ? "满号" : "暂停";

  if (loading) {
    return (
      <div className="page-root">
        <p className="muted">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-root">
        <p className="muted">加载失败：{error}</p>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">排班管理</h1>
          <p className="page-subtitle">按日期、科室、状态快速筛查医生档期，支持标签页独立查看。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
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
              <option value="OPEN">开放</option>
              <option value="RUNNING">进行中</option>
              <option value="FULL">满号</option>
              <option value="PAUSED">暂停</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">搜索</span>
            <input
              className="filter-input"
              placeholder="医生/科室"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
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
                <td>{row.workDate}</td>
                <td>
                  {row.startTime} - {row.endTime}
                </td>
                <td>
                  <div>{row.doctor?.name ?? "—"}</div>
                  <div className="muted">{row.department?.name ?? "—"}</div>
                </td>
                <td>{row.type === "SPECIALIST" ? "专家号" : row.type === "EXTRA" ? "加号" : "普通号"}</td>
                <td>
                  {row.booked} / {row.capacity}
                </td>
                <td>
                  <span className={`pill ${statusTone(row.status)}`}>{statusText(row.status)}</span>
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
