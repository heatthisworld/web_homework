import React, { useEffect, useMemo, useState } from "react";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../services/adminService";
import type { AdminDepartment } from "../../services/adminService";

type DeptStatus = "OPEN" | "PAUSED" | "ADJUSTING";

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"全部" | DeptStatus>("全部");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null>(null);
  const [formData, setFormData] = useState<Omit<AdminDepartment, "id">>({
    code: "",
    name: "",
    leadName: "",
    rooms: 0,
    focus: "",
    status: "OPEN"
  });
  const [formError, setFormError] = useState<string | null>(null);

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

  const resetForm = () => {
    setEditingDepartment(null);
    setFormData({
      code: "",
      name: "",
      leadName: "",
      rooms: 0,
      focus: "",
      status: "OPEN"
    });
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: AdminDepartment) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      leadName: department.leadName || "",
      rooms: department.rooms || 0,
      focus: department.focus || "",
      status: department.status
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // 验证必填字段
      if (!formData.code.trim()) {
        throw new Error("请输入科室代码");
      }
      if (!formData.name.trim()) {
        throw new Error("请输入科室名称");
      }

      console.log("准备提交数据:", formData);
      let updatedDepartment;
      if (editingDepartment) {
        // 更新科室
        updatedDepartment = await updateDepartment(editingDepartment.id, formData);
        console.log("更新科室成功:", updatedDepartment);
        setDepartments(prevDepartments => prevDepartments.map(dept => 
          dept.id === updatedDepartment.id ? updatedDepartment : dept
        ));
      } else {
        // 创建科室
        updatedDepartment = await createDepartment(formData);
        console.log("创建科室成功:", updatedDepartment);
        setDepartments(prevDepartments => [...prevDepartments, updatedDepartment]);
      }

      setIsModalOpen(false);
    } catch (e) {
      console.error("提交失败:", e);
      setFormError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (window.confirm(`确定要删除科室 "${name}" 吗？此操作不可恢复。`)) {
      try {
        await deleteDepartment(id);
        setDepartments(prevDepartments => prevDepartments.filter(dept => dept.id !== id));
      } catch (e) {
        alert(e instanceof Error ? e.message : "删除失败");
      }
    }
  };

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
          <button className="primary-button" type="button" onClick={handleOpenModal}>
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
              <div className="card-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <button 
                  className="small-button" 
                  onClick={() => handleEditDepartment(dept)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  编辑
                </button>
                <button 
                  className="small-button danger" 
                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  删除
                </button>
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
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="small-button" 
                      onClick={() => handleEditDepartment(dept)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      编辑
                    </button>
                    <button 
                      className="small-button danger" 
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
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

      {/* 新增/编辑科室模态框 */}
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
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingDepartment ? '编辑科室' : '新增科室'}
            </h2>
            
            {formError && (
              <div className="error-message" style={{
                backgroundColor: '#fef0f0',
                color: '#f56c6c',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{
                display: 'grid',
                gap: '16px'
              }}>
                <div className="form-group">
                  <label htmlFor="code" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    科室代码 *
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="name" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    科室名称 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="leadName" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    负责人
                  </label>
                  <input
                    type="text"
                    id="leadName"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="rooms" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    诊室数量
                  </label>
                  <input
                    type="number"
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="focus" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    当前重点
                  </label>
                  <textarea
                    id="focus"
                    name="focus"
                    value={formData.focus}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minHeight: '80px'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    状态 *
                  </label>
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
                    <option value="OPEN">开放</option>
                    <option value="PAUSED">暂停</option>
                    <option value="ADJUSTING">调整中</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
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
                  {editingDepartment ? "保存修改" : "创建科室"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
