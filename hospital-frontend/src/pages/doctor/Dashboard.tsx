import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // 模拟数据
  const todayPatients = [
    { id: 1, name: '张三', gender: '男', age: 35, department: '内科', time: '09:00', status: '已到诊' },
    { id: 2, name: '李四', gender: '女', age: 28, department: '内科', time: '10:00', status: '未到诊' },
    { id: 3, name: '王五', gender: '男', age: 42, department: '内科', time: '14:00', status: '已到诊' },
    { id: 4, name: '赵六', gender: '女', age: 50, department: '内科', time: '15:00', status: '未到诊' },
  ];

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

  return (
    <div className="dashboard">
      <h1>欢迎回来，张医生</h1>
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
              {todayPatients.map(patient => (
                <div key={patient.id} className="patient-item">
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-details">{patient.gender} | {patient.age}岁 | {patient.department}</div>
                  </div>
                  <div className="patient-schedule">
                    <div className="patient-time">{patient.time}</div>
                    <div className={`patient-status ${patient.status === '已到诊' ? 'arrived' : 'not-arrived'}`}>
                      {patient.status}
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default Dashboard;
