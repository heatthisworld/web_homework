import React, { useMemo, useState } from "react";

type UserRole = "医生" | "患者" | "管理员";
type UserStatus = "活跃" | "停用" | "待验证";

interface User {
  id: number;
  name: string;
  role: UserRole;
  department?: string;
  phone: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const mockUsers: User[] = [
    {
      id: 1001,
      name: "王若初",
      role: "管理员",
      department: "信息科",
      phone: "13800012001",
      email: "admin01@hospital.test",
      status: "活跃",
      createdAt: "2025-01-05",
      lastActive: "09:20",
    },
    {
      id: 2008,
      name: "陈俊",
      role: "医生",
      department: "内科",
      phone: "13800012008",
      email: "chenjun@hospital.test",
      status: "活跃",
      createdAt: "2025-02-03",
      lastActive: "08:55",
    },
    {
      id: 2016,
      name: "林静",
      role: "医生",
      department: "儿科",
      phone: "13900022016",
      email: "linjing@hospital.test",
      status: "活跃",
      createdAt: "2025-02-15",
      lastActive: "09:10",
    },
    {
      id: 3055,
      name: "李言",
      role: "医生",
      department: "眼科",
      phone: "13900023055",
      email: "liyan@hospital.test",
      status: "待验证",
      createdAt: "2025-03-01",
      lastActive: "待完善",
    },
    {
      id: 5011,
      name: "周岚",
      role: "患者",
      phone: "13700025011",
      email: "zhoulan@hospital.test",
      status: "活跃",
      createdAt: "2025-03-11",
      lastActive: "09:32",
    },
    {
      id: 5022,
      name: "刘杰",
      role: "患者",
      phone: "13700025022",
      email: "liujie@hospital.test",
      status: "停用",
      createdAt: "2025-03-02",
      lastActive: "08:02",
    },
    {
      id: 7003,
      name: "沈意",
      role: "管理员",
      department: "运维中心",
      phone: "13600027003",
      email: "sheny@hospital.test",
      status: "活跃",
      createdAt: "2025-01-28",
      lastActive: "09:00",
    },
  ];

  const [roleFilter, setRoleFilter] = useState<"全部" | UserRole>("全部");
  const [statusFilter, setStatusFilter] = useState<"全部" | UserStatus>("全部");
  const [keyword, setKeyword] = useState<string>("");

  const filtered = useMemo(() => {
    return mockUsers.filter((user) => {
      const byRole = roleFilter === "全部" ? true : user.role === roleFilter;
      const byStatus =
        statusFilter === "全部" ? true : user.status === statusFilter;
      const byKeyword = keyword
        ? [user.name, user.phone, user.email, user.department ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byRole && byStatus && byKeyword;
    });
  }, [keyword, mockUsers, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = mockUsers.length;
    const doctors = mockUsers.filter((u) => u.role === "医生").length;
    const patients = mockUsers.filter((u) => u.role === "患者").length;
    const locked = mockUsers.filter((u) => u.status !== "活跃").length;
    return { total, doctors, patients, locked };
  }, [mockUsers]);

  const statusPill = (status: UserStatus) => {
    if (status === "活跃") return "pill-success";
    if (status === "待验证") return "pill-warning";
    return "pill-danger";
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">用户管理</h1>
          <p className="page-subtitle">管理员、医生、患者统一在此维护，支持多条件筛选。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
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
              <option value="管理员">管理员</option>
              <option value="医生">医生</option>
              <option value="患者">患者</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">状态</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <option value="全部">全部</option>
              <option value="活跃">活跃</option>
              <option value="待验证">待验证</option>
              <option value="停用">停用</option>
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
          <span className="filter-chip">已筛选 {filtered.length} 人</span>
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
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <div>{user.role}</div>
                  <div className="muted">{user.department ?? "—"}</div>
                </td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`pill ${statusPill(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
