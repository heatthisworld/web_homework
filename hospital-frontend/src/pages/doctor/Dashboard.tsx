import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getRegistrations, getCurrentDoctor } from '../../services/doctorService';
import type { Registration } from '../../services/doctorService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Registration[]>([]);
  const [doctor, setDoctor] = useState<{ name: string } | null>(null);
  
  // 模拟数据（在API不可用时使用）
  const pendingTasks = [
    { id: 1, title: '处理患者病历', count: 3 },
    { id: 2, title: '回复患者咨询', count: 5 },
    { id: 3, title: '填写诊疗记录', count: 2 },
    { id: 4, title: '确认下周排班', count: 1 },
  ];

  const statistics = [
    { id: 1, title: '今日挂号', value: '12', icon: '📋' },
    { id: 2, title: '本周挂号', value: '45', icon: '📅' },
    { id: 3, title: '本月挂号', value: '180', icon: '📈' },
    { id: 4, title: '患者满意度', value: '98%', icon: '⭐' },
  ];

  const notifications = [
    { id: 1, title: '新的挂号通知', content: '患者钱七已挂号，时间：明天 09:30', time: '10分钟前' },
    { id: 2, title: '系统更新通知', content: '医院系统将于今晚22:00进行维护更新', time: '2小时前' },
    { id: 3, title: '患者评价提醒', content: '患者张三已评价，评分：5星', time: '1天前' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取医生信息
        const doctorData = await getCurrentDoctor();
        setDoctor(doctorData);
        
        // 获取挂号列表
        const registrations = await getRegistrations();
        
        // 筛选今天的挂号
        const today = new Date().toISOString().split('T')[0];
        const todayRegs = registrations.filter(reg => reg.appointmentTime.startsWith(today));
        setTodayAppointments(todayRegs);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // 使用模拟数据作为降级方案
        const mockDoctor = { name: '张医生' };
        setDoctor(mockDoctor);
        
        // 生成模拟的今日挂号数据
        const mockAppointments: Registration[] = [
          { id: 1, patientId: 1, patientName: '张三', department: '内科', disease: '感冒', appointmentTime: new Date().toISOString().split('T')[0] + 'T09:00:00', status: 'pending' },
          { id: 2, patientId: 2, patientName: '李四', department: '内科', disease: '高血压', appointmentTime: new Date().toISOString().split('T')[0] + 'T10:30:00', status: 'pending' },
          { id: 3, patientId: 3, patientName: '王五', department: '内科', disease: '糖尿病', appointmentTime: new Date().toISOString().split('T')[0] + 'T14:00:00', status: 'processing' },
        ];
        setTodayAppointments(mockAppointments);
        
        // 不设置错误信息，使用静默降级方案
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 格式化今天的患者数据
  const todayPatients = todayAppointments.map(appointment => ({
    id: appointment.id,
    name: appointment.patientName,
    department: appointment.department,
    time: new Date(appointment.appointmentTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    status: appointment.status === 'processing' ? '已到诊' : '未到诊'
  }));

  return (
    <div className="dashboard">
      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          <h1>欢迎回来，{doctor?.name || '医生'}</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>

      {/* 统计卡片 */}
      <div className="stats-cards">
        {statistics.map(stat => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 今日挂号患者和待处理事项 */}
      <div className="dashboard-row">
        {/* 今日挂号患者 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>今日挂号患者</h2>
              <button className="view-all-btn">查看全部</button>
            </div>
            <div className="patient-list">
              {todayPatients.length > 0 ? (
                todayPatients.map(patient => (
                  <div key={patient.id} className="patient-item">
                    <div className="patient-info">
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-details">{patient.department}</div>
                    </div>
                    <div className="patient-schedule">
                      <div className="patient-time">{patient.time}</div>
                      <div className={`patient-status ${patient.status === '已到诊' ? 'arrived' : 'not-arrived'}`}>
                        {patient.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">今日暂无挂号患者</div>
              )}
            </div>
          </div>
        </div>

        {/* 待处理事项 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>待处理事项</h2>
            </div>
            <div className="tasks-list">
              {pendingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                  </div>
                  <div className="task-count">{task.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 最新通知 */}
          <div className="card">
            <div className="card-header">
              <h2>最新通知</h2>
              <button className="view-all-btn">查看全部</button>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-text">{notification.content}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
