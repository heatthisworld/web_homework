import React, { useEffect, useMemo, useState } from "react";
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule, fetchDoctors, fetchDepartments } from "../../services/adminService";
import type { AdminSchedule, AdminDoctor, AdminDepartment } from "../../services/adminService";

type ShiftStatus = "OPEN" | "RUNNING" | "FULL" | "PAUSED";
const ScheduleType = "REGULAR" | "SPECIALIST" | "EXTRA";

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [department, setDepartment] = useState<string>("全部");
  const [status, setStatus] = useState<"全部" | ShiftStatus>("全部");
  const [date, setDate] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdminSchedule | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctorId: 0,
    departmentId: 0,
    workDate: "",
    startTime: "",
    endTime: "",
    type: "REGULAR" as const,
    status: "OPEN" as const,
    capacity: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesData, doctorsData, departmentsData] = await Promise.all([
          fetchSchedules(),
          fetchDoctors(),
          fetchDepartments()
        ]);
        setSchedules(schedulesData);
        setDoctors(doctorsData);
        setDepartments(departmentsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      doctorId: 0,
      departmentId: 0,
      workDate: "",
      startTime: "",
      endTime: "",
      type: "REGULAR" as const,
      status: "OPEN" as const,
      capacity: 0
    });
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule: AdminSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorId: schedule.doctor.id,
      departmentId: schedule.department.id,
      workDate: schedule.workDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
      status: schedule.status,
      capacity: schedule.capacity
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "doctorId") {
      const selectedDoctorId = parseInt(value);
      const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);
      
      if (selectedDoctor) {
        let departmentId = formData.departmentId;
        
        // 自动设置医生所属科室
        if (typeof selectedDoctor.department === 'string') {
          // 如果科室是字符串，需要查找对应的科室ID
          const matchingDept = departments.find(dept => 
            dept.name === selectedDoctor.department
          );
          if (matchingDept) {
            departmentId = matchingDept.id;
          }
        } else if (selectedDoctor.department?.id) {
          // 如果科室是对象，直接使用ID
          departmentId = selectedDoctor.department.id;
        }
        
        setFormData(prev => ({
          ...prev,
          doctorId: selectedDoctorId,
          departmentId: departmentId
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          doctorId: selectedDoctorId,
          departmentId: 0
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === "capacity" ? parseInt(value) || 0 : value
      }));
    }
  };

  const checkTimeConflict = () => {
    if (!formData.doctorId || !formData.workDate || !formData.startTime || !formData.endTime) {
      return false;
    }

    // 获取当前医生在同一日期的所有排班
    const doctorSchedules = schedules.filter(s => 
      s.doctor.id === formData.doctorId && 
      s.workDate === formData.workDate &&
      s.id !== editingSchedule?.id // 排除正在编辑的记录
    );

    for (const schedule of doctorSchedules) {
      // 检查时间是否重叠
      // 新排班的开始时间 < 已有排班的结束时间
      // 且新排班的结束时间 > 已有排班的开始时间
      if (formData.startTime < schedule.endTime && formData.endTime > schedule.startTime) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 验证表单
    if (!formData.doctorId || !formData.departmentId || !formData.workDate) {
      setFormError("请填写必填字段");
      return;
    }

    // 验证时间格式
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      setFormError("结束时间必须晚于开始时间");
      return;
    }

    // 检查时间冲突
    if (checkTimeConflict()) {
      setFormError("该医生在所选时间段已有排班，请选择其他时间");
      return;
    }

    try {
      const scheduleData = {
        doctor: { id: formData.doctorId },
        department: { id: formData.departmentId },
        workDate: formData.workDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        status: formData.status,
        capacity: formData.capacity
      };

      let updatedSchedule;
      if (editingSchedule) {
        updatedSchedule = await updateSchedule(editingSchedule.id, scheduleData);
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s));
      } else {
        updatedSchedule = await createSchedule(scheduleData);
        setSchedules(prev => [...prev, updatedSchedule]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleDeleteSchedule = async (id: number, hasBookings: boolean) => {
    if (hasBookings) {
      if (!window.confirm("该排班已有预约记录，删除将影响相关预约，确定要删除吗？")) {
        return;
      }
    } else if (!window.confirm("确定要删除该排班吗？")) {
      return;
    }

    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

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
          <button className="primary-button" type="button" onClick={handleOpenModal}>
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
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="small-button"
                      onClick={() => handleEditSchedule(row)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      编辑
                    </button>
                    <button 
                      className="small-button pill-danger"
                      onClick={() => handleDeleteSchedule(row.id, row.booked > 0)}
                      style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f87171', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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

      {/* 排班编辑模态框 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingSchedule ? "编辑排班" : "新建排班"}
            </h2>
            
            {formError && (
              <div style={{
                color: '#f56c6c',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    医生
                  </label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  >
                    <option value={0}>请选择医生</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {typeof doctor.department === 'string' ? doctor.department : doctor.department?.name || ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    科室
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  >
                    <option value={0}>请选择科室</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    日期
                  </label>
                  <input
                    type="date"
                    name="workDate"
                    value={formData.workDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      开始时间
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      结束时间
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    号源类型
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="REGULAR">普通号</option>
                    <option value="SPECIALIST">专家号</option>
                    <option value="EXTRA">加号</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    状态
                  </label>
                  <select
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
                    <option value="RUNNING">进行中</option>
                    <option value="FULL">满号</option>
                    <option value="PAUSED">暂停</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    最大号源数
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {editingSchedule ? "保存修改" : "创建排班"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
