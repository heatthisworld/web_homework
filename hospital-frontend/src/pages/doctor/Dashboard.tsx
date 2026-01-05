import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { getRegistrations, getCurrentDoctor, getPendingTasks, getStatistics, getNotifications } from '../../services/doctorService';
import type { Registration, Task, Statistic, Notification } from '../../services/doctorService';



const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Registration[]>([]);
  const [doctor, setDoctor] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();
  
  // 真实数据状态
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
        
        // 获取待处理事项
        const tasks = await getPendingTasks();
        setPendingTasks(tasks);
        
        // 获取统计数据
        const stats = await getStatistics();
        setStatistics(stats);
        
        // 获取通知
        const notices = await getNotifications();
        setNotifications(notices);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // API调用失败时使用默认数据显示空状态UI
        const defaultDoctor = { name: '李医生' };
        setDoctor(defaultDoctor);
        setTodayAppointments([]);
        setPendingTasks([]);
        setStatistics([]);
        setNotifications([]);
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
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <h1>欢迎回来，{doctor?.name || '医生'}</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>

      {/* 统计卡片 */}
      <div className="stats-cards">
        {statistics.length > 0 ? (
          statistics.map(stat => (
            <div key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon || '📊'}</div>
              <div className="stat-content">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">{stat.value || '-'}</div>
              </div>
            </div>
          ))
        ) : (
          // 空状态的统计卡片
          <>
            <div className="stat-card empty-stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-title">今日接诊</div>
                <div className="stat-value">0</div>
                <div className="stat-hint">暂无接诊记录</div>
              </div>
            </div>
            <div className="stat-card empty-stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-title">本月患者</div>
                <div className="stat-value">0</div>
                <div className="stat-hint">暂无患者数据</div>
              </div>
            </div>
            <div className="stat-card empty-stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-title">患者满意度</div>
                <div className="stat-value">0%</div>
                <div className="stat-hint">暂无评价</div>
              </div>
            </div>
            <div className="stat-card empty-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-title">工作量</div>
                <div className="stat-value">0</div>
                <div className="stat-hint">暂无统计</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 今日挂号患者和待处理事项 */}
      <div className="dashboard-row">
        {/* 今日挂号患者 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>今日挂号患者</h2>
              <button className="view-all-btn" onClick={() => navigate('/doctor/registration')}>查看全部</button>
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
                <div className="empty-state-container">
                  <div className="empty-state-icon">👨‍⚕️</div>
                  <div className="empty-state-title">今日暂无挂号患者</div>
                  <div className="empty-state-description">今天还没有患者挂号，您可以：</div>
                  <div className="empty-state-actions">
                    <button className="empty-state-btn" onClick={() => navigate('/doctor/registration')}>查看历史挂号</button>
                    <button className="empty-state-btn" onClick={() => navigate('/doctor/schedule')}>调整排班</button>
                  </div>
                </div>
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
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                    </div>
                    <div className="task-count">{task.count || 0}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state-container">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-title">暂无待处理事项</div>
                  <div className="empty-state-description">所有事项已处理完毕，保持良好状态！</div>
                </div>
              )}
            </div>
          </div>

          {/* 最新通知 */}
          <div className="card">
            <div className="card-header">
              <h2>最新通知</h2>
              <button className="view-all-btn" onClick={() => navigate('/doctor/registration')}>查看全部</button>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-text">{notification.content}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-container">
                  <div className="empty-state-icon">📬</div>
                  <div className="empty-state-title">暂无通知</div>
                  <div className="empty-state-description">目前没有新的通知</div>
                  <div className="empty-state-actions">
                    <button className="empty-state-btn" onClick={() => navigate('/doctor/registration')}>查看所有通知</button>
                  </div>
                </div>
              )}
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
