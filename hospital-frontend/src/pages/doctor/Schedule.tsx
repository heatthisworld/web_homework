import React, { useState } from 'react';
import './Schedule.css';

interface ScheduleItem {
  id: number;
  date: string;
  time: string;
  patientName: string;
  patientId: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  department: string;
  symptoms: string;
}

interface WorkingHour {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

interface LeaveRequest {
  id: number;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Schedule: React.FC = () => {
  // 模拟数据
  const scheduleItems: ScheduleItem[] = [
    {
      id: 1,
      date: '2025-12-11',
      time: '09:00',
      patientName: '张三',
      patientId: 101,
      status: 'confirmed',
      department: '内科',
      symptoms: '头痛、发热'
    },
    {
      id: 2,
      date: '2025-12-11',
      time: '10:00',
      patientName: '李四',
      patientId: 102,
      status: 'pending',
      department: '内科',
      symptoms: '咳嗽、喉咙痛'
    },
    {
      id: 3,
      date: '2025-12-11',
      time: '14:00',
      patientName: '王五',
      patientId: 103,
      status: 'confirmed',
      department: '内科',
      symptoms: '腹痛、腹泻'
    },
    {
      id: 4,
      date: '2025-12-12',
      time: '09:30',
      patientName: '钱七',
      patientId: 105,
      status: 'pending',
      department: '内科',
      symptoms: '胸闷、气短'
    }
  ];

  const workingHours: WorkingHour[] = [
    { id: 1, day: '周一', startTime: '08:00', endTime: '17:00', isWorking: true },
    { id: 2, day: '周二', startTime: '08:00', endTime: '17:00', isWorking: true },
    { id: 3, day: '周三', startTime: '08:00', endTime: '17:00', isWorking: true },
    { id: 4, day: '周四', startTime: '08:00', endTime: '17:00', isWorking: true },
    { id: 5, day: '周五', startTime: '08:00', endTime: '17:00', isWorking: true },
    { id: 6, day: '周六', startTime: '09:00', endTime: '15:00', isWorking: true },
    { id: 7, day: '周日', startTime: '', endTime: '', isWorking: false }
  ];

  const leaveRequests: LeaveRequest[] = [
    { id: 1, date: '2025-12-18', reason: '个人原因', status: 'pending' },
    { id: 2, date: '2025-12-25', reason: '节假日', status: 'approved' }
  ];

  // 状态管理
  const [activeTab, setActiveTab] = useState<'schedule' | 'workingHours' | 'leave'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingWorkingHour, setEditingWorkingHour] = useState<WorkingHour | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState<{ date: string; reason: string }>({ date: '', reason: '' });

  // 筛选当天的日程
  const todaySchedule = scheduleItems.filter(item => item.date === selectedDate);

  // 提交调休申请
  const submitLeaveRequest = () => {
    if (newLeaveRequest.date && newLeaveRequest.reason) {
      // 这里可以添加提交逻辑
      alert('调休申请已提交');
      setNewLeaveRequest({ date: '', reason: '' });
    }
  };

  // 保存工作时间
  const saveWorkingHour = () => {
    if (editingWorkingHour) {
      // 这里可以添加保存逻辑
      alert('工作时间已保存');
      setEditingWorkingHour(null);
    }
  };

  return (
    <div className="schedule">
      <h1>日程安排</h1>
      
      {/* 标签页 */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          预约日程
        </button>
        <button 
          className={`tab-btn ${activeTab === 'workingHours' ? 'active' : ''}`}
          onClick={() => setActiveTab('workingHours')}
        >
          出诊时间设置
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          调休申请
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="tab-content">
        {/* 预约日程 */}
        {activeTab === 'schedule' && (
          <div className="schedule-view">
            <div className="schedule-header">
              <h2>预约日程</h2>
              <div className="date-selector">
                <label>选择日期：</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="schedule-list">
              {todaySchedule.length > 0 ? (
                todaySchedule.map(item => (
                  <div key={item.id} className={`schedule-item status-${item.status}`}>
                    <div className="schedule-time">{item.time}</div>
                    <div className="schedule-info">
                      <div className="patient-name">{item.patientName} (ID: {item.patientId})</div>
                      <div className="patient-details">{item.department} | {item.symptoms}</div>
                    </div>
                    <div className={`schedule-status status-${item.status}`}>
                      {item.status === 'confirmed' ? '已确认' : 
                       item.status === 'pending' ? '待确认' : '已取消'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-schedule">该日期暂无预约日程</div>
              )}
            </div>
          </div>
        )}
        
        {/* 出诊时间设置 */}
        {activeTab === 'workingHours' && (
          <div className="working-hours">
            <h2>出诊时间设置</h2>
            
            <div className="working-hours-list">
              {workingHours.map(hour => (
                <div key={hour.id} className="working-hour-item">
                  <div className="day-info">
                    <div className="day-name">{hour.day}</div>
                    <div className="working-toggle">
                      <input 
                        type="checkbox" 
                        checked={hour.isWorking} 
                        onChange={(e) => {
                          setEditingWorkingHour({
                            ...hour,
                            isWorking: e.target.checked
                          });
                        }}
                      />
                      <label>{hour.isWorking ? '出诊' : '休息'}</label>
                    </div>
                  </div>
                  
                  {hour.isWorking && (
                    <div className="time-setting">
                      {editingWorkingHour?.id === hour.id ? (
                        <div className="time-editing">
                          <input 
                            type="time" 
                            value={hour.startTime} 
                            onChange={(e) => {
                              setEditingWorkingHour(prev => prev ? { ...prev, startTime: e.target.value } : null);
                            }}
                          />
                          <span>至</span>
                          <input 
                            type="time" 
                            value={hour.endTime} 
                            onChange={(e) => {
                              setEditingWorkingHour(prev => prev ? { ...prev, endTime: e.target.value } : null);
                            }}
                          />
                          <button className="save-btn" onClick={saveWorkingHour}>保存</button>
                        </div>
                      ) : (
                        <div className="time-display">
                          <span>{hour.startTime}</span>
                          <span>至</span>
                          <span>{hour.endTime}</span>
                          <button 
                            className="edit-btn" 
                            onClick={() => setEditingWorkingHour(hour)}
                          >
                            编辑
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 调休申请 */}
        {activeTab === 'leave' && (
          <div className="leave-requests">
            <div className="leave-header">
              <h2>调休申请</h2>
              
              {/* 新增调休申请 */}
              <div className="new-leave-request">
                <h3>申请调休</h3>
                <div className="leave-form">
                  <div className="form-group">
                    <label>调休日期：</label>
                    <input 
                      type="date" 
                      value={newLeaveRequest.date} 
                      onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>调休原因：</label>
                    <textarea 
                      value={newLeaveRequest.reason} 
                      onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="请输入调休原因"
                      rows={3}
                    ></textarea>
                  </div>
                  <button 
                    className="submit-btn" 
                    onClick={submitLeaveRequest}
                    disabled={!newLeaveRequest.date || !newLeaveRequest.reason}
                  >
                    提交申请
                  </button>
                </div>
              </div>
            </div>
            
            {/* 调休申请列表 */}
            <div className="leave-requests-list">
              <h3>调休记录</h3>
              {leaveRequests.length > 0 ? (
                leaveRequests.map(request => (
                  <div key={request.id} className={`leave-request-item status-${request.status}`}>
                    <div className="leave-date">{request.date}</div>
                    <div className="leave-reason">{request.reason}</div>
                    <div className={`leave-status status-${request.status}`}>
                      {request.status === 'pending' ? '待审批' : 
                       request.status === 'approved' ? '已批准' : '已拒绝'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-leave-requests">暂无调休记录</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
