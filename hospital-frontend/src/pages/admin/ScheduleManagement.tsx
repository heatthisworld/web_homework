import React, { useState } from 'react';

interface Schedule {
  id: number;
  doctorId: number;
  doctorName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable' | 'booked';
  maxPatients: number;
  currentPatients: number;
}

const ScheduleManagement: React.FC = () => {
  // 模拟数据
  const schedules: Schedule[] = [
    { 
      id: 1, 
      doctorId: 1, 
      doctorName: '张医生', 
      department: '内科', 
      date: '2025-12-12', 
      startTime: '09:00', 
      endTime: '12:00', 
      status: 'available', 
      maxPatients: 15, 
      currentPatients: 8 
    },
    { 
      id: 2, 
      doctorId: 1, 
      doctorName: '张医生', 
      department: '内科', 
      date: '2025-12-12', 
      startTime: '14:00', 
      endTime: '17:00', 
      status: 'available', 
      maxPatients: 15, 
      currentPatients: 5 
    },
    { 
      id: 3, 
      doctorId: 2, 
      doctorName: '李医生', 
      department: '外科', 
      date: '2025-12-12', 
      startTime: '09:00', 
      endTime: '12:00', 
      status: 'unavailable', 
      maxPatients: 12, 
      currentPatients: 0 
    },
    { 
      id: 4, 
      doctorId: 3, 
      doctorName: '王医生', 
      department: '儿科', 
      date: '2025-12-13', 
      startTime: '09:00', 
      endTime: '12:00', 
      status: 'available', 
      maxPatients: 20, 
      currentPatients: 12 
    },
    { 
      id: 5, 
      doctorId: 4, 
      doctorName: '赵医生', 
      department: '妇产科', 
      date: '2025-12-13', 
      startTime: '14:00', 
      endTime: '17:00', 
      status: 'booked', 
      maxPatients: 10, 
      currentPatients: 10 
    },
    { 
      id: 6, 
      doctorId: 5, 
      doctorName: '刘医生', 
      department: '眼科', 
      date: '2025-12-14', 
      startTime: '09:00', 
      endTime: '12:00', 
      status: 'available', 
      maxPatients: 18, 
      currentPatients: 7 
    },
  ];

  // 状态管理
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>(schedules);
  const [selectedDate, setSelectedDate] = useState<string>('2025-12-12');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 筛选排班
  const filterSchedules = () => {
    let filtered = [...schedules];

    // 按日期筛选
    if (selectedDate) {
      filtered = filtered.filter(schedule => schedule.date === selectedDate);
    }

    // 按科室筛选
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(schedule => schedule.department === selectedDepartment);
    }

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.doctorName.toLowerCase().includes(term) ||
        schedule.department.toLowerCase().includes(term)
      );
    }

    setFilteredSchedules(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterSchedules();
  }, [selectedDate, selectedDepartment, selectedStatus, searchTerm]);

  // 获取状态显示文本
  const getStatusText = (status: Schedule['status']) => {
    const statusMap = {
      available: '可预约',
      unavailable: '不可预约',
      booked: '已约满'
    };
    return statusMap[status];
  };

  // 获取状态样式类名
  const getStatusClass = (status: Schedule['status']) => {
    return `status-${status}`;
  };

  // 获取科室列表
  const departments = [...new Set(schedules.map(schedule => schedule.department))];

  return (
    <div className="schedule-management">
      <h1>排班管理</h1>
      
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
              <option value="available">可预约</option>
              <option value="unavailable">不可预约</option>
              <option value="booked">已约满</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <input 
              type="text" 
              placeholder="搜索医生姓名或科室..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <button className="btn btn-primary" onClick={filterSchedules}>
              筛选
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSelectedDate('2025-12-12');
              setSelectedDepartment('all');
              setSelectedStatus('all');
              setSearchTerm('');
            }}>
              重置
            </button>
          </div>
        </div>
      </div>
      
      {/* 排班列表 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>日期</th>
              <th>科室</th>
              <th>医生</th>
              <th>时间段</th>
              <th>状态</th>
              <th>可预约人数</th>
              <th>已预约人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map(schedule => (
                <tr key={schedule.id}>
                  <td>{schedule.id}</td>
                  <td>{schedule.date}</td>
                  <td>{schedule.department}</td>
                  <td>{schedule.doctorName}</td>
                  <td>{schedule.startTime} - {schedule.endTime}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(schedule.status)}`}>
                      {getStatusText(schedule.status)}
                    </span>
                  </td>
                  <td>{schedule.maxPatients}</td>
                  <td>{schedule.currentPatients}</td>
                  <td className="action-buttons">
                    <button className="btn btn-sm btn-primary">查看</button>
                    <button className="btn btn-sm btn-secondary">编辑</button>
                    <button className="btn btn-sm btn-danger">删除</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data">
                  暂无排班数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManagement;