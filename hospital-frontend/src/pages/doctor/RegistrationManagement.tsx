import React, { useState, useEffect } from 'react';
import './RegistrationManagement.css';
import { getRegistrations, updateRegistrationStatus, batchUpdateRegistrationStatus, updateRegistration, createMedicalRecord, getMedicalRecordByRegistration } from '../../services/doctorService';
import type { Registration, RegistrationStatus, MedicalRecordPayload, MedicalRecordDetail } from '../../services/doctorService';

const RegistrationManagement: React.FC = () => {
  // 状态管理
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 查看详情和修改功能状态
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Partial<Registration> | null>(null);
  const [saving, setSaving] = useState(false);
  // 病历录入
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordTarget, setRecordTarget] = useState<Registration | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);
  const [completeAfterSave, setCompleteAfterSave] = useState(false);
  const [recordForm, setRecordForm] = useState<MedicalRecordPayload>({
    symptoms: '',
    diagnosis: '',
    medication: '',
    examinations: '',
    treatment: '',
    notes: '',
  });

  // 获取挂号数据
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRegistrations();
        setRegistrations(data);
      } catch (err) {
        console.error('获取挂号数据失败:', err);
        // 使用友好的错误信息，不显示技术细节
        setError('获取挂号数据失败，系统正在使用模拟数据提供服务');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // 筛选挂号记录
  const filterRegistrations = () => {
    let filtered = [...registrations];

    // 按日期筛选
    if (selectedDate) {
      filtered = filtered.filter(reg => reg.appointmentTime.startsWith(selectedDate));
    }

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reg => reg.status === selectedStatus);
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.patientName.toLowerCase().includes(term) ||
        reg.patientId.toString().includes(term) ||
        reg.disease.toLowerCase().includes(term)
      );
    }

    setFilteredRegistrations(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterRegistrations();
  }, [registrations, selectedDate, selectedStatus, searchTerm]);

  // 更新挂号状态
  const handleUpdateStatus = async (id: number, status: RegistrationStatus) => {
    try {
      await updateRegistrationStatus(id, status);
      // 更新本地状态
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === id ? { ...reg, status } : reg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新状态失败';
      console.error('更新挂号状态失败:', err);
      alert(`更新状态失败: ${errorMessage}`);
    }
  };

  // 批量更新状态
  // 完成前检查是否已有病历
  const handleComplete = (registration: Registration) => {
    if (!registration.hasMedicalRecord) {
      openRecordModal(registration, true);
      return;
    }
    handleUpdateStatus(registration.id, 'completed');
  };

  const batchUpdateStatus = async (status: RegistrationStatus) => {
    if (selectedRegistrations.length === 0) return;
    if (status === 'completed') {
      const missingRecord = registrations.filter(reg => selectedRegistrations.includes(reg.id) && !reg.hasMedicalRecord);
      if (missingRecord.length > 0) {
        alert('所选挂号中存在未提交病历的记录，请先提交病历再完成。');
        return;
      }
    }
    
    try {
      await batchUpdateRegistrationStatus(selectedRegistrations, status);
      // 更新本地状态
      setRegistrations(prev => 
        prev.map(reg => 
          selectedRegistrations.includes(reg.id) ? { ...reg, status } : reg
        )
      );
      setSelectedRegistrations([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量更新失败';
      console.error('批量更新状态失败:', err);
      alert(`批量更新失败: ${errorMessage}`);
    }
  };

  // 切换选择状态
  const toggleSelectRegistration = (id: number) => {
    setSelectedRegistrations(prev => 
      prev.includes(id)
        ? prev.filter(regId => regId !== id)
        : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredRegistrations.map(reg => reg.id));
    }
  };

  // 打开详情模态框
  const openDetailModal = (registration: Registration) => {
    setSelectedRegistration(registration);
    setEditingRegistration(registration);
    setIsModalOpen(true);
  };

  // 关闭详情模态框
  const closeDetailModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    setEditingRegistration(null);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingRegistration(prev => prev ? { ...prev, [name]: value } : null);
  };

  // 保存修改
  const handleSaveChanges = async () => {
    if (!selectedRegistration || !editingRegistration) return;
    
    setSaving(true);
    try {
      await updateRegistration(selectedRegistration.id, editingRegistration);
      
      // 更新本地状态
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === selectedRegistration.id ? { ...reg, ...editingRegistration } : reg
        )
      );
      
      closeDetailModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存失败';
      console.error('保存挂号信息失败:', err);
      alert(`保存失败: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRecordInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecordForm(prev => ({ ...prev, [name]: value }));
  };

  const openRecordModal = async (registration: Registration, completeAfter: boolean) => {
    setRecordTarget(registration);
    setCompleteAfterSave(completeAfter);
    setRecordModalOpen(true);
    setRecordLoading(true);
    try {
      const record: MedicalRecordDetail = await getMedicalRecordByRegistration(registration.id);
      setRecordForm({
        symptoms: record.symptoms || '',
        diagnosis: record.diagnosis || '',
        medication: record.medication || '',
        examinations: record.examinations || '',
        treatment: record.treatment || '',
        notes: record.notes || '',
      });
    } catch (err) {
      // 若不存在病历或获取失败，使用空表单
      setRecordForm({
        symptoms: '',
        diagnosis: '',
        medication: '',
        examinations: '',
        treatment: '',
        notes: '',
      });
    } finally {
      setRecordLoading(false);
    }
  };

  const handleSaveMedicalRecord = async () => {
    if (!recordTarget) return;
    if (!recordForm.symptoms && !recordForm.diagnosis) {
      alert('请至少填写症状或诊断');
      return;
    }
    setRecordSaving(true);
    try {
      await createMedicalRecord(recordTarget.id, recordForm);
      setRegistrations(prev =>
        prev.map(reg => reg.id === recordTarget.id ? { ...reg, hasMedicalRecord: true } : reg)
      );
      setRecordModalOpen(false);
      setRecordTarget(null);
      if (completeAfterSave) {
        await handleUpdateStatus(recordTarget.id, 'completed');
      }
      setCompleteAfterSave(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交病历失败';
      alert(errorMessage);
    } finally {
      setRecordSaving(false);
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: Registration['status']) => {
    const statusMap = {
      pending: '待确认',
      processing: '处理中',
      cancelled: '已取消',
      completed: '已完成'
    };
    return statusMap[status];
  };

  // 获取状态样式类名
  const getStatusClass = (status: Registration['status']) => {
    return `status-${status}`;
  };

  return (
    <div className="registration-management">
      <h1>挂号管理</h1>
      
      {/* 筛选和搜索 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>日期：</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>
          
          <div className="filter-group">
            <label>状态：</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
            >
              <option value="all">全部状态</option>
              <option value="pending">待确认</option>
              <option value="processing">处理中</option>
              <option value="cancelled">已取消</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <input 
              type="text" 
              placeholder="搜索患者姓名、ID或症状..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      {/* 批量操作 */}
      {selectedRegistrations.length > 0 && (
        <div className="batch-actions">
          <span>已选择 {selectedRegistrations.length} 条记录</span>
          <div className="batch-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => batchUpdateStatus('processing')}
            >
              批量处理
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => batchUpdateStatus('cancelled')}
            >
              批量取消
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => batchUpdateStatus('completed')}
            >
              批量完成
            </button>
          </div>
        </div>
      )}
      
      {/* 挂号列表 */}
      <div className="registration-table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">
            <p>获取数据失败: {error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>刷新</button>
          </div>
        ) : (
          <table className="registration-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0} 
                    onChange={toggleSelectAll} 
                  />
                </th>
                <th>患者ID</th>
                <th>患者姓名</th>
                <th>性别</th>
                <th>年龄</th>
                <th>科室</th>
                <th>就诊时间</th>
                <th>症状</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map(registration => (
                  <tr key={registration.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedRegistrations.includes(registration.id)} 
                        onChange={() => toggleSelectRegistration(registration.id)} 
                      />
                    </td>
                    <td>{registration.patientId}</td>
                    <td>{registration.patientName}</td>
                    <td>未知</td>
                    <td>未知</td>
                    <td>{registration.department}</td>
                    <td>{registration.appointmentTime}</td>
                    <td>{registration.disease}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {registration.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleUpdateStatus(registration.id, 'processing')}
                          >
                            确认
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleUpdateStatus(registration.id, 'cancelled')}
                          >
                            取消
                          </button>
                          <button 
                            className="btn btn-sm btn-info" 
                            onClick={() => openDetailModal(registration)}
                          >
                            查看详情
                          </button>
                        </>
                      )}
                      {registration.status === 'processing' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleComplete(registration)}
                          >
                            完成
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleUpdateStatus(registration.id, 'cancelled')}
                          >
                            取消
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => openRecordModal(registration, false)}
                          >
                            编辑病历
                          </button>
                          <button 
                            className="btn btn-sm btn-info" 
                            onClick={() => openDetailModal(registration)}
                          >
                            查看详情
                          </button>
                        </>
                      )}
                      {registration.status === 'completed' && (
                        <>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => openRecordModal(registration, false)}
                          >
                            编辑病历
                          </button>
                          <button 
                            className="btn btn-sm btn-info" 
                            onClick={() => openDetailModal(registration)}
                          >
                            查看详情
                          </button>
                        </>
                      )}
                      {registration.status === 'cancelled' && (
                        <button 
                          className="btn btn-sm btn-info" 
                          onClick={() => openDetailModal(registration)}
                        >
                          查看详情
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="no-data">
                    暂无挂号记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 病历录入 */}
      {recordModalOpen && recordTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>提交病历</h2>
              <button className="close-btn" onClick={() => { setRecordModalOpen(false); setRecordTarget(null); setCompleteAfterSave(false); }}>&times;</button>
            </div>
            <div className="modal-body">
              {recordLoading && <div className="loading">加载病历中...</div>}
              <div className="form-group">
                <label>症状</label>
                <textarea
                  name="symptoms"
                  value={recordForm.symptoms || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  rows={2}
                  disabled={recordLoading}
                />
              </div>
              <div className="form-group">
                <label>诊断</label>
                <textarea
                  name="diagnosis"
                  value={recordForm.diagnosis || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  rows={2}
                  disabled={recordLoading}
                />
              </div>
              <div className="form-group">
                <label>用药</label>
                <input
                  type="text"
                  name="medication"
                  value={recordForm.medication || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  placeholder="多个用逗号分隔"
                  disabled={recordLoading}
                />
              </div>
              <div className="form-group">
                <label>检查</label>
                <input
                  type="text"
                  name="examinations"
                  value={recordForm.examinations || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  disabled={recordLoading}
                />
              </div>
              <div className="form-group">
                <label>治疗方案</label>
                <textarea
                  name="treatment"
                  value={recordForm.treatment || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  rows={2}
                  disabled={recordLoading}
                />
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  name="notes"
                  value={recordForm.notes || ''}
                  onChange={handleRecordInputChange}
                  className="form-control"
                  rows={2}
                  disabled={recordLoading}
                />
              </div>
              <p className="hint">提交病历后才能将挂号标记为完成。</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setRecordModalOpen(false); setRecordTarget(null); setCompleteAfterSave(false); }}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSaveMedicalRecord} disabled={recordSaving || recordLoading}>
                {recordSaving ? '提交中...' : (completeAfterSave ? '提交并完成' : '保存病历')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {isModalOpen && selectedRegistration && editingRegistration && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>挂号详情</h2>
              <button className="close-btn" onClick={closeDetailModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>患者ID</label>
                <input 
                  type="text" 
                  name="patientId" 
                  value={editingRegistration.patientId || ''} 
                  onChange={handleInputChange} 
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>患者姓名</label>
                <input 
                  type="text" 
                  name="patientName" 
                  value={editingRegistration.patientName || ''} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>科室</label>
                <input 
                  type="text" 
                  name="department" 
                  value={editingRegistration.department || ''} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>症状</label>
                <textarea 
                  name="disease" 
                  value={editingRegistration.disease || ''} 
                  onChange={handleInputChange} 
                  className="form-control"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>就诊时间</label>
                <input 
                  type="datetime-local" 
                  name="appointmentTime" 
                  value={editingRegistration.appointmentTime ? editingRegistration.appointmentTime.slice(0, 16) : ''} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>状态</label>
                <select 
                  name="status" 
                  value={editingRegistration.status || 'completed'} 
                  onChange={handleInputChange} 
                  className="form-control"
                >
                  <option value="pending">待确认</option>
                  <option value="processing">处理中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailModal}>取消</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveChanges} 
                disabled={saving}
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;
