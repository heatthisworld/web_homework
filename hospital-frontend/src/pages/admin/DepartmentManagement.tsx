import React, { useEffect, useMemo, useState } from "react";
import { fetchDepartments } from "../../services/adminService";
import type { AdminDepartment } from "../../services/adminService";

type DeptStatus = "OPEN" | "PAUSED" | "ADJUSTING";

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"全部" | DeptStatus>("全部");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return departments.filter((dept) => {
      const byStatus = statusFilter === "全部" ? true : dept.status === statusFilter;
      const byKeyword = keyword
        ? [dept.name, dept.leadName ?? "", dept.focus ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byStatus && byKeyword;
    });
  }, [departments, statusFilter, keyword]);

  const statusTone = (status: DeptStatus) => {
    if (status === "OPEN") return "pill-success";
    if (status === "ADJUSTING") return "pill-warning";
    return "pill-danger";
  };

  const statusText = (status: DeptStatus) =>
    status === "OPEN" ? "开放" : status === "PAUSED" ? "暂停" : "调整中";

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
          <h1 className="page-heading">科室管理</h1>
          <p className="page-subtitle">掌握各科室人力、诊室与状态，便于挂号与排班联动。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
          <button className="primary-button" type="button">
            新增科室
          </button>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">科室面板</h3>
          <span className="badge">与挂号、排班共享</span>
        </div>

        <div className="card-grid">
          {filtered.map((dept) => (
            <div key={dept.id} className="card-item">
              <div className="table-actions">
                <strong>{dept.name}</strong>
                <span className={`pill ${statusTone(dept.status)}`}>{statusText(dept.status)}</span>
              </div>
              <p className="muted">{dept.focus ?? "—"}</p>
              <div className="inline-list">
                <span className="badge">负责人 {dept.leadName ?? "未设置"}</span>
                <span className="badge">诊室 {dept.rooms ?? 0}</span>
                <span className="badge">代码 {dept.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">科室列表</h3>
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">状态</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="全部">全部</option>
                <option value="OPEN">开放</option>
                <option value="PAUSED">暂停</option>
                <option value="ADJUSTING">调整中</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">关键词</span>
              <input
                className="filter-input"
                placeholder="科室/负责人/重点"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <span className="filter-chip">结果 {filtered.length}</span>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>负责人</th>
              <th>诊室数</th>
              <th>状态</th>
              <th>当前重点</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.leadName ?? "—"}</td>
                <td>{dept.rooms ?? "—"}</td>
                <td>
                  <span className={`pill ${statusTone(dept.status)}`}>{statusText(dept.status)}</span>
                </td>
                <td>{dept.focus ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentManagement;
