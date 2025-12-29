import React, { useEffect, useMemo, useState } from "react";
import { fetchRegistrations, updateRegistration, deleteRegistration } from "../../services/adminService";
import type { AdminRegistration } from "../../services/adminService";

type RegStatus = "WAITING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const RegistrationManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [status, setStatus] = useState<"全部" | RegStatus>("全部");
  const [department, setDepartment] = useState<string>("全部");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 编辑模态框状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<AdminRegistration | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminRegistration>>({
    status: "WAITING"
  });
  
  // 删除确认对话框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<number | null>(null);

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

  // 编辑处理函数
  const handleEdit = (registration: AdminRegistration) => {
    setEditingRegistration(registration);
    setEditFormData({
      status: registration.status as RegStatus,
      notes: registration.notes
    });
    setEditModalVisible(true);
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;
    
    try {
      console.log("编辑提交数据:", { id: editingRegistration.id, data: editFormData });
      const updatedRegistration = await updateRegistration(editingRegistration.id, editFormData);
      setRegistrations(prev => prev.map(reg => 
        reg.id === updatedRegistration.id ? updatedRegistration : reg
      ));
      setEditModalVisible(false);
    } catch (err) {
      console.error("编辑失败错误:", err);
      alert(`编辑失败：${err instanceof Error ? err.message : "未知错误"}`);
    }
  };
  
  // 删除处理函数
  const handleDelete = (id: number) => {
    setDeletingRegistrationId(id);
    setDeleteModalVisible(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingRegistrationId) return;
    
    try {
      await deleteRegistration(deletingRegistrationId);
      setRegistrations(prev => prev.filter(reg => reg.id !== deletingRegistrationId));
      setDeleteModalVisible(false);
    } catch (err) {
      alert(`删除失败：${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

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
              <th>操作</th>
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
                <td>
                  <div className="button-group">
                    <button 
                      className="button-small primary-button"
                      onClick={() => handleEdit(row)}
                    >
                      编辑
                    </button>
                    <button 
                      className="button-small danger-button"
                      onClick={() => handleDelete(row.id)}
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

      {/* 编辑模态框 */}
      {editModalVisible && editingRegistration && (
        <div style={{ 
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
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            width: '400px', 
            maxWidth: '90%' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2>编辑挂号信息</h2>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer' 
                }}
                onClick={() => setEditModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div>
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>状态</label>
                  <select 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc' 
                    }}
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value as RegStatus}))}
                  >
                    <option value="WAITING">待确认</option>
                    <option value="CONFIRMED">已确认</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>备注</label>
                  <textarea 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc', 
                      minHeight: '80px' 
                    }}
                    value={editFormData.notes || ""}
                    onChange={(e) => setEditFormData(prev => ({...prev, notes: e.target.value}))}
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '10px' 
                }}>
                  <button 
                    type="button"
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => setEditModalVisible(false)}
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '4px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteModalVisible && deletingRegistrationId && (
        <div style={{ 
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
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            width: '400px', 
            maxWidth: '90%' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2>确认删除</h2>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer' 
                }}
                onClick={() => setDeleteModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div>
              <p>确定要删除这条挂号记录吗？此操作不可恢复。</p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px', 
                marginTop: '20px' 
              }}>
                <button 
                  type="button"
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => setDeleteModalVisible(false)}
                >
                  取消
                </button>
                <button 
                  type="button"
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                  onClick={handleDeleteConfirm}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;
