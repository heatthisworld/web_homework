import React, { useState } from 'react';

interface StatisticsProps {
  // 可以根据需要添加props
}

interface MonthlyStat {
  month: string;
  registrations: number;
  patients: number;
  revenue: number;
}

interface DepartmentStat {
  name: string;
  count: number;
  percentage: number;
}

const Statistics: React.FC<StatisticsProps> = () => {
  // 模拟数据
  const monthlyStats: MonthlyStat[] = [
    { month: '1月', registrations: 3245, patients: 2892, revenue: 45678 },
    { month: '2月', registrations: 2987, patients: 2654, revenue: 42345 },
    { month: '3月', registrations: 3456, patients: 3123, revenue: 48901 },
    { month: '4月', registrations: 3123, patients: 2890, revenue: 46789 },
    { month: '5月', registrations: 3678, patients: 3345, revenue: 50123 },
    { month: '6月', registrations: 3890, patients: 3567, revenue: 52456 },
    { month: '7月', registrations: 4123, patients: 3890, revenue: 55678 },
    { month: '8月', registrations: 4345, patients: 4012, revenue: 58901 },
    { month: '9月', registrations: 4567, patients: 4234, revenue: 61234 },
    { month: '10月', registrations: 4789, patients: 4456, revenue: 64567 },
    { month: '11月', registrations: 5012, patients: 4678, revenue: 67890 },
    { month: '12月', registrations: 5234, patients: 4901, revenue: 71234 },
  ];

  const departmentStats: DepartmentStat[] = [
    { name: '内科', count: 1245, percentage: 35.6 },
    { name: '外科', count: 892, percentage: 25.5 },
    { name: '儿科', count: 654, percentage: 18.7 },
    { name: '妇产科', count: 432, percentage: 12.3 },
    { name: '眼科', count: 321, percentage: 9.2 },
    { name: '其他', count: 96, percentage: 2.7 },
  ];

  const doctorStats = [
    { id: 1, name: '张医生', department: '内科', registrations: 456, patients: 321, satisfaction: 98 },
    { id: 2, name: '李医生', department: '外科', registrations: 345, patients: 289, satisfaction: 96 },
    { id: 3, name: '王医生', department: '儿科', registrations: 234, patients: 198, satisfaction: 99 },
    { id: 4, name: '赵医生', department: '妇产科', registrations: 189, patients: 156, satisfaction: 97 },
    { id: 5, name: '刘医生', department: '眼科', registrations: 145, patients: 123, satisfaction: 95 },
  ];

  // 状态管理
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedStatType, setSelectedStatType] = useState<string>('registrations');

  return (
    <div className="statistics">
      <h1>统计报表</h1>
      
      {/* 筛选条件 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>年份：</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023">2023年</option>
              <option value="2024">2024年</option>
              <option value="2025">2025年</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>统计类型：</label>
            <select 
              value={selectedStatType} 
              onChange={(e) => setSelectedStatType(e.target.value)}
            >
              <option value="registrations">挂号数量</option>
              <option value="patients">患者数量</option>
              <option value="revenue">收入统计</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 年度统计概览 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-title">年度总挂号</div>
            <div className="stat-value">{monthlyStats.reduce((sum, stat) => sum + stat.registrations, 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-title">年度总患者</div>
            <div className="stat-value">{monthlyStats.reduce((sum, stat) => sum + stat.patients, 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-title">年度总收入</div>
            <div className="stat-value">¥{monthlyStats.reduce((sum, stat) => sum + stat.revenue, 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-title">平均月挂号</div>
            <div className="stat-value">{Math.round(monthlyStats.reduce((sum, stat) => sum + stat.registrations, 0) / 12).toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* 月度统计图表 */}
      <div className="card">
        <div className="card-header">
          <h2>月度统计</h2>
        </div>
        <div className="chart-container">
          {/* 这里可以添加图表库，现在用简单的柱状图模拟 */}
          <div className="bar-chart">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="bar-chart-item">
                <div className="bar-chart-label">{stat.month}</div>
                <div className="bar-chart-bar">
                  <div 
                    className="bar-chart-fill" 
                    style={{ 
                      height: `${(stat[selectedStatType as keyof MonthlyStat] as number / Math.max(...monthlyStats.map(s => s[selectedStatType as keyof MonthlyStat] as number))) * 100}%`,
                      backgroundColor: '#3498db'
                    }}
                  ></div>
                </div>
                <div className="bar-chart-value">
                  {(stat[selectedStatType as keyof MonthlyStat] as number).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 科室分布和医生排名 */}
      <div className="dashboard-row">
        {/* 科室分布 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>科室分布</h2>
            </div>
            <div className="department-stats">
              {departmentStats.map((stat, index) => (
                <div key={index} className="department-stat-item">
                  <div className="department-stat-info">
                    <div className="department-stat-name">{stat.name}</div>
                    <div className="department-stat-bar">
                      <div 
                        className="department-stat-fill" 
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: '#3498db'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="department-stat-count">
                    {stat.count} ({stat.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 医生排名 */}
        <div className="dashboard-column">
          <div className="card">
            <div className="card-header">
              <h2>医生绩效排名</h2>
            </div>
            <div className="doctor-rankings">
              {doctorStats.map((stat, index) => (
                <div key={index} className="doctor-ranking-item">
                  <div className="doctor-ranking-rank">{index + 1}</div>
                  <div className="doctor-ranking-info">
                    <div className="doctor-ranking-name">{stat.name}</div>
                    <div className="doctor-ranking-department">{stat.department}</div>
                  </div>
                  <div className="doctor-ranking-stats">
                    <div className="doctor-ranking-registrations">
                      挂号: {stat.registrations}
                    </div>
                    <div className="doctor-ranking-satisfaction">
                      满意度: {stat.satisfaction}%
                    </div>
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

export default Statistics;