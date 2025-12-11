import React, { useState } from 'react';

interface Registration {
  id: number;
  patientId: number;
  patientName: string;
  gender: string;
  age: number;
  department: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  registrationType: 'online' | 'offline';
}

const RegistrationManagement: React.FC = () => {
  // 模拟数据
  const registrations: Registration[] = [
    { 
      id: 1, 
      patientId: 101, 
      patientName: '张三', 
      gender: '男', 
      age: 35, 
      department: '内科', 
      doctorName: '张医生', 
      date: '2025-12-11', 
      time: '09:00', 
      status: 'completed', 
      symptoms: '头痛、发热',
      registrationType: 'online'
    },
    { 
      id: 2, 
      patientId: 102, 
      patientName: '李四', 
      gender: '女', 
      age: 28, 
      department: '内科', 
      doctorName: '张医生', 
      date: '2025-12-11', 
      time: '10:00', 
      status: 'completed', 
      symptoms: '咳嗽、喉咙痛',
      registrationType: 'online'
    },
    { 
      id: 3, 
      patientId: 103, 
      patientName: '王五', 
      gender: '男', 
      age: 42, 
      department: '外科', 
      doctorName: '李医生', 
      date: '2025-12-12', 
      time: '14:00', 
      status: 'confirmed', 
      symptoms: '腹痛、腹泻',
      registrationType: 'offline'
    },
    { 
      id: 4, 
      patientId: 104, 
      patientName: '赵六', 
      gender: '女', 
      age: 50, 
      department: '内科', 
      doctorName: '张医生', 
      date: '2025-12-12', 
      time: '15:00', 
      status: 'pending', 
      symptoms: '高血压、头晕',
      registrationType: 'online'
    },
    { 
      id: 5, 
      patientId: 105, 
      patientName: '钱七', 
      gender: '男', 
      age: 38, 
      department: '儿科', 
      doctorName: '王医生', 
      date: '2025-12-13', 
      time: '09:30', 
      status: 'pending', 
      symptoms: '胸闷、气短',
      registrationType: 'online'
    },
    { 
      id: 6, 
      patientId: 106, 
      patientName: '孙八', 
      gender: '女', 
      age: 25, 
      department: '妇产科', 
      doctorName: '赵医生', 
      date: '2025-12-13', 
      time: '10:00', 
      status: 'confirmed', 
      symptoms: '孕期检查',
      registrationType: 'offline'
    },
    { 
      id: 7, 
      patientId: 107, 
      patientName: '周九', 
      gender: '男', 
      age: 60, 
      department: '眼科', 
      doctorName: '刘医生', 
      date: '2025-12-14', 
      time: '09:00', 
      status: 'pending', 
      symptoms: '视力模糊',
      registrationType: 'online'
    },
  ];

  // 状态管理
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>(registrations);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);

  // 筛选挂号记录
  const filterRegistrations = () => {
    let filtered = [...registrations];

    // 按日期筛选
    if (selectedDate) {
      filtered = filtered.filter(reg => reg.date === selectedDate);
    }

    // 按科室筛选
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(reg => reg.department === selectedDepartment);
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
        reg.symptoms.toLowerCase().includes(term)
      );
    }

    setFilteredRegistrations(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterRegistrations();
  }, [selectedDate, selectedDepartment, selectedStatus, searchTerm]);

  // 更新挂号状态
  const updateRegistrationStatus = (id: number, status: Registration['status']) => {
    setFilteredRegistrations(prev => 
      prev.map(reg => 
        reg.id === id ? { ...reg, status } : reg
      )
    );
  };

  // 批量更新状态
  const batchUpdateStatus = (status: Registration['status']) => {
    if (selectedRegistrations.length === 0) return;
    
    setFilteredRegistrations(prev => 
      prev.map(reg => 
        selectedRegistrations.includes(reg.id) ? { ...reg, status } : reg
      )
    );
    
    setSelectedRegistrations([]);
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

  // 获取状态显示文本
  const getStatusText = (status: Registration['status']) => {
    const statusMap = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成'
    };
    return statusMap[status];
  };

  // 获取状态样式类名
  const getStatusClass = (status: Registration['status']) => {
    return `status-${status}`;
  };

  // 获取挂号类型显示文本
  const getRegistrationTypeText = (type: Registration['registrationType']) => {
    return type === 'online' ? '线上' : '线下';
  };

  // 获取科室列表
  const departments = [...new Set(registrations.map(reg => reg.department))];

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
            <label>科室：</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">全部科室</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>状态：</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="pending">待确认</option>
              <option value="confirmed">已确认</option>
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
          
          <div className="filter-group">
            <button className="btn btn-primary" onClick={filterRegistrations}>
              筛选
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSelectedDate('');
              setSelectedDepartment('all');
              setSelectedStatus('all');
              setSearchTerm('');
            }}>
              重置
            </button>
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
              onClick={() => batchUpdateStatus('confirmed')}
            >
              批量确认
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
      <div className="table-container">
        <table className="table">
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
              <th>医生</th>
              <th>日期</th>
              <th>时间</th>
              <th>类型</th>
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
                  <td>{registration.gender}</td>
                  <td>{registration.age}</td>
                  <td>{registration.department}</td>
                  <td>{registration.doctorName}</td>
                  <td>{registration.date}</td>
                  <td>{registration.time}</td>
                  <td>{getRegistrationTypeText(registration.registrationType)}</td>
                  <td>{registration.symptoms}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(registration.status)}`}>
                      {getStatusText(registration.status)}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="btn btn-sm btn-primary">查看</button>
                    {registration.status === 'pending' && (
                      <>  
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => updateRegistrationStatus(registration.id, 'confirmed')}
                        >
                          确认
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => updateRegistrationStatus(registration.id, 'cancelled')}
                        >
                          取消
                        </button>
                      </>
                    )}
                    {registration.status === 'confirmed' && (
                      <>  
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => updateRegistrationStatus(registration.id, 'completed')}
                        >
                          完成
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => updateRegistrationStatus(registration.id, 'cancelled')}
                        >
                          取消
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="no-data">
                  暂无挂号记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationManagement;