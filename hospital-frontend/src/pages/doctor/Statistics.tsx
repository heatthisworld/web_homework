import React, { useState } from 'react';
import './Statistics.css';

interface WorkloadData {
  date: string;
  count: number;
}

interface DepartmentData {
  name: string;
  count: number;
  percentage: number;
}

interface SatisfactionData {
  rating: number;
  count: number;
  percentage: number;
}

interface IncomeData {
  month: string;
  amount: number;
}

const Statistics: React.FC = () => {
  // 模拟数据
  const workloadData: WorkloadData[] = [
    { date: '2025-11-01', count: 8 },
    { date: '2025-11-02', count: 12 },
    { date: '2025-11-03', count: 10 },
    { date: '2025-11-04', count: 15 },
    { date: '2025-11-05', count: 13 },
    { date: '2025-11-06', count: 9 },
    { date: '2025-11-07', count: 7 },
    { date: '2025-11-08', count: 11 },
    { date: '2025-11-09', count: 14 },
    { date: '2025-11-10', count: 16 },
  ];

  const departmentData: DepartmentData[] = [
    { name: '内科', count: 45, percentage: 45 },
    { name: '外科', count: 25, percentage: 25 },
    { name: '儿科', count: 15, percentage: 15 },
    { name: '妇科', count: 10, percentage: 10 },
    { name: '眼科', count: 5, percentage: 5 },
  ];

  const satisfactionData: SatisfactionData[] = [
    { rating: 5, count: 85, percentage: 85 },
    { rating: 4, count: 12, percentage: 12 },
    { rating: 3, count: 2, percentage: 2 },
    { rating: 2, count: 0, percentage: 0 },
    { rating: 1, count: 1, percentage: 1 },
  ];

  const incomeData: IncomeData[] = [
    { month: '2025-01', amount: 12000 },
    { month: '2025-02', amount: 15000 },
    { month: '2025-03', amount: 18000 },
    { month: '2025-04', amount: 16000 },
    { month: '2025-05', amount: 20000 },
    { month: '2025-06', amount: 22000 },
    { month: '2025-07', amount: 25000 },
    { month: '2025-08', amount: 23000 },
    { month: '2025-09', amount: 28000 },
    { month: '2025-10', amount: 30000 },
    { month: '2025-11', amount: 32000 },
    { month: '2025-12', amount: 35000 },
  ];

  // 状态管理
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');

  // 计算统计数据
  const totalPatients = workloadData.reduce((sum, item) => sum + item.count, 0);
  const averageDailyPatients = Math.round(totalPatients / workloadData.length);
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const overallSatisfaction = Math.round(
    satisfactionData.reduce((sum, item) => sum + item.rating * item.count, 0) /
    satisfactionData.reduce((sum, item) => sum + item.count, 0)
  );

  return (
    <div className="statistics">
      <h1>统计报表</h1>
      
      {/* 统计概览卡片 */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-title">总接诊人数</div>
            <div className="stat-value">{totalPatients}</div>
            <div className="stat-subtitle">人</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-title">日均接诊</div>
            <div className="stat-value">{averageDailyPatients}</div>
            <div className="stat-subtitle">人</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-title">满意度</div>
            <div className="stat-value">{overallSatisfaction}.0</div>
            <div className="stat-subtitle">分</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-title">总收入</div>
            <div className="stat-value">{totalIncome.toLocaleString()}</div>
            <div className="stat-subtitle">元</div>
          </div>
        </div>
      </div>
      
      {/* 时间范围选择 */}
      <div className="time-range-selector">
        <span>时间范围：</span>
        <button 
          className={`range-btn ${timeRange === 'day' ? 'active' : ''}`}
          onClick={() => setTimeRange('day')}
        >
          日
        </button>
        <button 
          className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          周
        </button>
        <button 
          className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          月
        </button>
      </div>
      
      {/* 统计图表区域 */}
      <div className="charts-section">
        {/* 工作量统计 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>工作量统计</h3>
          </div>
          <div className="chart-content">
            <div className="workload-chart">
              {workloadData.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${(item.count / Math.max(...workloadData.map(i => i.count))) * 100}%` }}
                  ></div>
                  <div className="chart-label">{item.date.split('-').slice(1).join('-')}</div>
                  <div className="chart-value">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 科室挂号统计 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>科室挂号统计</h3>
          </div>
          <div className="chart-content">
            <div className="department-chart">
              {departmentData.map((item, index) => (
                <div key={index} className="department-item">
                  <div className="department-info">
                    <div className="department-name">{item.name}</div>
                    <div className="department-count">{item.count} 人</div>
                  </div>
                  <div className="department-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                    <div className="progress-text">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 患者满意度 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>患者满意度</h3>
          </div>
          <div className="chart-content">
            <div className="satisfaction-chart">
              <div className="satisfaction-score">
                <div className="score-value">{overallSatisfaction}.0</div>
                <div className="score-label">分</div>
              </div>
              
              <div className="rating-distribution">
                {satisfactionData.map((item, index) => (
                  <div key={index} className="rating-item">
                    <div className="rating-label">{item.rating}星</div>
                    <div className="rating-progress">
                      <div 
                        className="progress-bar"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="rating-count">{item.count}人 ({item.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 收入统计 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>收入统计</h3>
          </div>
          <div className="chart-content">
            <div className="income-chart">
              <div className="income-line-container">
                <div className="income-line">
                  {incomeData.map((item, index) => (
                    <div 
                      key={index}
                      className="income-point"
                      style={{ 
                        left: `${(index / (incomeData.length - 1)) * 100}%`,
                        bottom: `${(item.amount / Math.max(...incomeData.map(i => i.amount))) * 100}%`
                      }}
                      title={`${item.month}：${item.amount}元`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="income-labels">
                {incomeData.map((item, index) => (
                  <div 
                    key={index}
                    className="income-label"
                    style={{ left: `${(index / (incomeData.length - 1)) * 100}%` }}
                  >
                    {item.month.split('-')[1]}月
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
