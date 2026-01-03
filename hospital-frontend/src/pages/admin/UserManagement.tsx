import React, { useEffect, useMemo, useState } from "react";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../services/adminService";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<Omit<AdminUser, "id" | "createdAt" | "updatedAt" | "lastLoginAt">>({
    username: "",
    //password: "", // 添加密码字段
    role: "PATIENT",
    displayName: "",
    email: "",
    phone: "",
    status: "ACTIVE"
  });

  const [formError, setFormError] = useState<string | null>(null);

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

 // 表单处理函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError(null);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      role: "PATIENT",
      displayName: "",
      email: "",
      phone: "",
      status: "ACTIVE"
    });
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // 编辑时密码可选
      role: user.role,
      displayName: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");
    setFormError(null);

    try {
      // 验证必填字段
      if (!formData.username.trim()) {
        throw new Error("请输入用户名");
      }
      if (!editingUser && !formData.password) {
        throw new Error("请输入密码");
      }

      const userData = { ...formData };
      if (!userData.password) {
        // 如果是编辑且密码为空，不包含密码字段
        delete userData.password;
      }

      console.log("准备提交数据:", userData);
      let updatedUser;
      if (editingUser) {
        // 更新用户
        updatedUser = await updateUser(editingUser.id, userData);
        console.log("更新用户成功:", updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      } else {
        // 创建用户
        updatedUser = await createUser(userData);
        console.log("创建用户成功:", updatedUser);
        setUsers(prevUsers => [...prevUsers, updatedUser]);
      }

      setIsModalOpen(false);
    } catch (e) {
      console.error("提交失败:", e);
      setFormError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (window.confirm(`确定要删除用户 ${username} 吗？此操作不可恢复。`)) {
      try {
        await deleteUser(id);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败");
      }
    }
  };

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
          <button className="primary-button" type="button" onClick={handleOpenModal}>
            新增用户
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
              <th>操作</th>
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
                <td>
                  <div className="action-buttons">
                    <button 
                      className="secondary-button" 
                      type="button"
                      onClick={() => handleEditUser(user)}
                    >
                      编辑
                    </button>
                    <button 
                      className="danger-button" 
                      type="button"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 用户表单模态框 */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000 
        }}>
          <div className="modal" style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '80vh', 
            overflowY: 'auto', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' 
          }}>
            <div className="modal-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingUser ? "编辑用户" : "新增用户"}</h2>
              <button 
                className="close-button" 
                onClick={() => setIsModalOpen(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer', 
                  color: '#666' 
                }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>{formError}</div>}
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="username" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>用户名 *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="请输入用户名"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{editingUser ? "密码 (可选)" : "密码 *"}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="请输入密码"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="role" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>角色 *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  >
                    <option value="ADMIN">管理员</option>
                    <option value="DOCTOR">医生</option>
                    <option value="PATIENT">患者</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="displayName" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>显示名称</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="请输入显示名称"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>邮箱</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="请输入邮箱"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="phone" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>电话</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="请输入电话"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="status" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>状态 *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  >
                    <option value="ACTIVE">活跃</option>
                    <option value="PENDING">待验证</option>
                    <option value="INACTIVE">停用</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px' 
              }}>
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#f0f0f0', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#1890ff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  {editingUser ? "保存修改" : "创建用户"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
