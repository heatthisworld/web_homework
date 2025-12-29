import React, { useState, useEffect } from 'react';
import './Schedule.css';
import {
  getWorkingHours,
  updateWorkingHours,
  submitLeaveRequest,
  getRegistrations
} from '../../services/doctorService';
import type {
  WorkingHour,
  LeaveRequest,
  Registration
} from '../../services/doctorService';

const dayMap = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
};

const Schedule: React.FC = () => {
  // 状态管理
  const [scheduleItems, setScheduleItems] = useState<Registration[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [leaveRequests] = useState<LeaveRequest[]>([]);

  // 状态管理
  const [activeTab, setActiveTab] = useState<'schedule' | 'workingHours' | 'leave'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingWorkingHour, setEditingWorkingHour] = useState<WorkingHour | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState<{ date: string; reason: string }>({ date: '', reason: '' });
  const [loading, setLoading] = useState({ schedule: false, workingHours: false, leaveRequests: false });
  // const [error, setError] = useState<string | null>(null);

  // 筛选当天的日程
  const todaySchedule = scheduleItems.filter(item => item.appointmentTime.startsWith(selectedDate));

  // 获取数据
  useEffect(() => {
    // 获取预约日程
    const fetchSchedule = async () => {
          setLoading(prev => ({ ...prev, schedule: true }));
          try {
            const data = await getRegistrations();
            setScheduleItems(data);
          } catch (err) {
            console.error('获取预约日程失败:', err);
            alert('获取预约日程失败');
          } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
          }
        };

        // 获取工作时间
        const fetchWorkingHours = async () => {
          setLoading(prev => ({ ...prev, workingHours: true }));
          try {
            const data = await getWorkingHours();
            setWorkingHours(data);
          } catch (err) {
            console.error('获取工作时间失败:', err);
            // 不显示错误信息，让doctorService中的模拟数据机制处理
          } finally {
            setLoading(prev => ({ ...prev, workingHours: false }));
          }
        };

    fetchSchedule();
    fetchWorkingHours();
  }, []);

  // 提交调休申请
  const handleSubmitLeaveRequest = async () => {
    if (newLeaveRequest.date && newLeaveRequest.reason) {
      try {
        await submitLeaveRequest({
          startDate: newLeaveRequest.date,
          endDate: newLeaveRequest.date,
          reason: newLeaveRequest.reason
        });
        alert('调休申请已提交');
        setNewLeaveRequest({ date: '', reason: '' });
      } catch (err) {
        console.error('提交调休申请失败:', err);
        alert('提交调休申请失败');
      }
    }
  };

  // 保存工作时间
  const saveWorkingHour = async () => {
    if (editingWorkingHour) {
      try {
        // 更新本地工作时间列表
        const updatedWorkingHours = workingHours.map(hour => 
          hour.id === editingWorkingHour.id ? editingWorkingHour : hour
        );
        
        // 保存到服务器
        await updateWorkingHours(updatedWorkingHours);
        
        // 更新本地状态
        setWorkingHours(updatedWorkingHours);
        alert('工作时间已保存');
        setEditingWorkingHour(null);
      } catch (err) {
        console.error('保存工作时间失败:', err);
        alert('保存工作时间失败');
      }
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
                    <div className="schedule-time">{item.appointmentTime.split('T')[1].substring(0, 5)}</div>
                    <div className="schedule-info">
                      <div className="patient-name">{item.patientName} (ID: {item.patientId})</div>
                      <div className="patient-details">{item.department} | {item.disease}</div>
                    </div>
                    <div className={`schedule-status status-${item.status}`}>
                      {item.status === 'processing' ? '处理中' : 
                       item.status === 'pending' ? '待确认' : 
                       item.status === 'completed' ? '已完成' : '已取消'}
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
              {loading.workingHours ? (
                <div className="loading">正在加载工作时间...</div>
              ) : workingHours.length > 0 ? (
                workingHours.map(hour => (
                  <div key={hour.id} className="working-hour-item">
                    <div className="day-info">
                      <div className="day-name">{dayMap[hour.dayOfWeek as keyof typeof dayMap]}</div>
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
                ))
              ) : (
                <div className="no-data">暂无工作时间设置</div>
              )}
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
                    onClick={handleSubmitLeaveRequest}
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
                    <div className="leave-date">{request.startDate}</div>
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
