import React, { useEffect, useMemo, useState } from "react";
import { fetchRegistrations } from "../../services/adminService";
import type { AdminRegistration } from "../../services/adminService";

type RegStatus = "WAITING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const RegistrationManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [status, setStatus] = useState<"全部" | RegStatus>("全部");
  const [department, setDepartment] = useState<string>("全部");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRegistrations();
        setRegistrations(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueDepartments = useMemo(() => {
    return Array.from(
      new Set(
        registrations.map((item) => {
          const d = item.doctor?.department;
          if (typeof d === "string") return d;
          if (d && "name" in d) return (d as any).name;
          return item.disease?.department ?? "未分配";
        })
      )
    );
  }, [registrations]);

  const filtered = useMemo(() => {
    return registrations.filter((item) => {
      const byStatus = status === "全部" ? true : item.status === status;
      const deptVal = item.doctor?.department;
      const deptName =
        typeof deptVal === "string"
          ? deptVal
          : deptVal && (deptVal as any).name
          ? (deptVal as any).name
          : item.disease?.department ?? "未分配";
      const byDept = department === "全部" ? true : deptName === department;
      const byKeyword = keyword
        ? [item.patient?.name ?? "", item.doctor?.name ?? "", item.notes ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byStatus && byDept && byKeyword;
    });
  }, [department, keyword, registrations, status]);

  const statusTone = (value: RegStatus) => {
    if (value === "COMPLETED") return "pill-success";
    if (value === "CONFIRMED") return "pill-info";
    if (value === "WAITING") return "pill-warning";
    return "pill-danger";
  };

  const statusText = (value: RegStatus) =>
    value === "COMPLETED" ? "已完成" : value === "CONFIRMED" ? "已确认" : value === "WAITING" ? "待确认" : "已取消";

  const stats = useMemo(() => {
    const pending = registrations.filter((r) => r.status === "WAITING").length;
    const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
    const finished = registrations.filter((r) => r.status === "COMPLETED").length;
    return { pending, confirmed, finished };
  }, [registrations]);

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
          <h1 className="page-heading">挂号管理</h1>
          <p className="page-subtitle">与排班、科室联动的挂号视图，状态一目了然。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
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
              <option value="WAITING">待确认</option>
              <option value="CONFIRMED">已确认</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
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
                <td>{row.patient?.name ?? "—"}</td>
                <td>
                  <div>
                    {typeof row.doctor?.department === "string"
                      ? row.doctor?.department
                      : (row.doctor?.department as any)?.name ?? row.disease?.department ?? "—"}
                  </div>
                  <div className="muted">{row.doctor?.name ?? "—"}</div>
                </td>
                <td>{row.appointmentTime ? row.appointmentTime.split("T")[0] : "—"}</td>
                <td>
                  {row.appointmentTime
                    ? new Date(row.appointmentTime).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td>{row.channel === "OFFLINE" ? "线下" : "线上"}</td>
                <td>{row.type === "SPECIALIST" ? "专家号" : row.type === "EXTRA" ? "加号" : "普通号"}</td>
                <td>
                  <span className={`pill ${statusTone(row.status as RegStatus)}`}>
                    {statusText(row.status as RegStatus)}
                  </span>
                </td>
                <td>{row.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationManagement;
