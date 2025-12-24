import React, { useEffect, useMemo, useState } from "react";
import { fetchUsers } from "../../services/adminService";
import type { AdminUser } from "../../services/adminService";

type UserRole = "DOCTOR" | "PATIENT" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<"全部" | UserRole>("全部");
  const [statusFilter, setStatusFilter] = useState<"全部" | UserStatus>("全部");
  const [keyword, setKeyword] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    if (loading || error) return [];
    return users.filter((user) => {
      const byRole = roleFilter === "全部" ? true : user.role === roleFilter;
      const byStatus = statusFilter === "全部" ? true : user.status === statusFilter;
      const byKeyword = keyword
        ? [user.username, user.displayName ?? "", user.email ?? "", user.phone ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byRole && byStatus && byKeyword;
    });
  }, [users, roleFilter, statusFilter, keyword, loading, error]);

  const stats = useMemo(() => {
    const total = users.length;
    const doctors = users.filter((u) => u.role === "DOCTOR").length;
    const patients = users.filter((u) => u.role === "PATIENT").length;
    const locked = users.filter((u) => u.status !== "ACTIVE").length;
    return { total, doctors, patients, locked };
  }, [users]);

  const roleText = (role: UserRole) =>
    role === "DOCTOR" ? "医生" : role === "PATIENT" ? "患者" : "管理员";
  const statusText = (status?: UserStatus) =>
    status === "INACTIVE" ? "停用" : status === "PENDING" ? "待验证" : "活跃";
  const statusTone = (status?: UserStatus) =>
    status === "INACTIVE" ? "pill-danger" : status === "PENDING" ? "pill-warning" : "pill-success";

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
          <h1 className="page-heading">用户管理</h1>
          <p className="page-subtitle">管理员、医生、患者统一在此维护，支持多条件筛选。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
          <button className="primary-button" type="button">
            导出名单
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-meta">
            <div className="stat-label">总用户</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-trend up">活跃占比 86%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🩺</div>
          <div className="stat-meta">
            <div className="stat-label">医生</div>
            <div className="stat-value">{stats.doctors}</div>
            <div className="stat-trend up">科室覆盖 12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧑‍🤝‍🧑</div>
          <div className="stat-meta">
            <div className="stat-label">患者</div>
            <div className="stat-value">{stats.patients}</div>
            <div className="stat-trend up">近 7 天新增 58</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-meta">
            <div className="stat-label">待处理</div>
            <div className="stat-value">{stats.locked}</div>
            <div className="stat-trend down">需激活或停用</div>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">用户列表</h3>
          <span className="badge">支持标签页打开查看详情</span>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">角色</span>
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            >
              <option value="全部">全部</option>
              <option value="ADMIN">管理员</option>
              <option value="DOCTOR">医生</option>
              <option value="PATIENT">患者</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">状态</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="全部">全部</option>
              <option value="ACTIVE">活跃</option>
              <option value="PENDING">待验证</option>
              <option value="INACTIVE">停用</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">关键词</span>
            <input
              className="filter-input"
              placeholder="姓名 / 科室 / 电话 / 邮箱"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <span className="filter-chip">已筛选 {filteredUsers.length} 人</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色 / 科室</th>
              <th>联系方式</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>最近活动</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.displayName ?? user.username}</td>
                <td>
                  <div>{roleText(user.role as UserRole)}</div>
                  <div className="muted">—</div>
                </td>
                <td>{user.phone ?? "—"}</td>
                <td>{user.email ?? "—"}</td>
                <td>
                  <span className={`pill ${statusTone(user.status as UserStatus)}`}>
                    {statusText(user.status as UserStatus)}
                  </span>
                </td>
                <td>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN") : "—"}
                </td>
                <td>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("zh-CN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
