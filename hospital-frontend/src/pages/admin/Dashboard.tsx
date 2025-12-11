import React from 'react';

const Dashboard: React.FC = () => {
  // 模拟数据
  const statistics = [
    { id: 1, title: '总用户数', value: '1,258', icon: '👥', color: '#3498db' },
    { id: 2, title: '医生数量', value: '86', icon: '👨‍⚕️', color: '#2ecc71' },
    { id: 3, title: '患者数量', value: '1,172', icon: '👤', color: '#f39c12' },
    { id: 4, title: '科室数量', value: '12', icon: '🏥', color: '#e74c3c' },
    { id: 5, title: '今日挂号', value: '156', icon: '📋', color: '#9b59b6' },
    { id: 6, title: '本月挂号', value: '4,238', icon: '📅', color: '#1abc9c' },
  ];

  const recentActivities = [
    { id: 1, user: '张三', action: '新增了医生账号', time: '2小时前' },
    { id: 2, user: '李四', action: '修改了科室信息', time: '4小时前' },
    { id: 3, user: '王五', action: '审核了挂号记录', time: '6小时前' },
    { id: 4, user: '赵六', action: '更新了系统设置', time: '1天前' },
    { id: 5, user: '钱七', action: '添加了排班记录', time: '1天前' },
  ];

  const departmentStats = [
    { id: 1, name: '内科', count: 1245 },
    { id: 2, name: '外科', count: 892 },
    { id: 3, name: '儿科', count: 654 },
    { id: 4, name: '妇产科', count: 432 },
    { id: 5, name: '眼科', count: 321 },
  ];

  return (
    <div className="dashboard">
      <h1>系统仪表盘</h1>
      <p className="dashboard-date">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>

      {/* 统计卡片 */}
      <div className="stats-cards">
        {statistics.map(stat => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 部门统计和最近活动 */}
      <div className="dashboard-row">
        {/* 部门统计 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>科室挂号统计</h2>
            </div>
            <div className="department-stats">
              {departmentStats.map(dept => (
                <div key={dept.id} className="department-stat-item">
                  <div className="department-stat-info">
                    <div className="department-stat-name">{dept.name}</div>
                    <div className="department-stat-bar">
                      <div 
                        className="department-stat-fill" 
                        style={{ 
                          width: `${(dept.count / Math.max(...departmentStats.map(d => d.count))) * 100}%`,
                          backgroundColor: '#3498db'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="department-stat-count">{dept.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>最近活动</h2>
            </div>
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">🔔</div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.user}</strong> {activity.action}
                    </div>
                    <div className="activity-time">{activity.time}</div>
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