import React, { useState, useEffect } from 'react';
import './Statistics.css';
import { generateReportData } from '../../services/doctorService';

interface TooltipData {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

interface WorkloadData {
  date: string;
  count: number;
  avgDuration: number;
}

interface DepartmentData {
  name: string;
  count: number;
}

interface SatisfactionData {
  rating: number;
  count: number;
}

interface IncomeData {
  month: string;
  amount: number;
}

interface AgeDistributionData {
  ageRange: string;
  count: number;
}

// 定义时间范围数据接口
interface TimeRangeData {
  workloadData: WorkloadData[];
  departmentData: DepartmentData[];
  satisfactionData: SatisfactionData[];
  incomeData: IncomeData[];
  ageDistributionData: AgeDistributionData[];
}

// 使用API获取数据，不再使用模拟数据

const Statistics: React.FC = () => {
  // 状态管理
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<TimeRangeData>({
    workloadData: [],
    departmentData: [],
    satisfactionData: [],
    incomeData: [],
    ageDistributionData: []
  });

  // Tooltip显示处理函数
  const handleTooltipShow = (content: string, event: React.MouseEvent) => {
    const tooltipElement = event.currentTarget.getBoundingClientRect();
    const containerElement = document.querySelector('.statistics');
    if (!containerElement) return;
    
    const containerRect = containerElement.getBoundingClientRect();
    
    setTooltip({
      visible: true,
      content,
      x: tooltipElement.left - containerRect.left + tooltipElement.width / 2,
      y: tooltipElement.top - containerRect.top - 10
    });
  };

  // Tooltip隐藏处理函数
  const handleTooltipHide = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // 数据加载逻辑
  useEffect(() => {
    // 从API获取真实数据
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 调用API获取统计数据
        const data = await generateReportData(timeRange);
        setCurrentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // 计算统计数据
  const totalPatients = currentData.workloadData.reduce((sum, item) => sum + item.count, 0);
  const averageDailyPatients = Math.round(totalPatients / currentData.workloadData.length);
  const totalIncome = currentData.incomeData.reduce((sum, item) => sum + item.amount, 0);
  
  // 整体满意度计算 - 添加防零处理
  const overallSatisfaction = (() => {
    const totalRatings = currentData.satisfactionData.reduce((sum, item) => sum + item.rating * item.count, 0);
    const totalCount = currentData.satisfactionData.reduce((sum, item) => sum + item.count, 0);
    return totalCount > 0 ? Math.round(totalRatings / totalCount) : 0;
  })();
  
  // 计算各类型数据的总数，用于动态计算百分比
  const totalDepartmentCount = currentData.departmentData.reduce((sum, item) => sum + item.count, 0);
  const totalSatisfactionCount = currentData.satisfactionData.reduce((sum, item) => sum + item.count, 0);
  const totalAgeCount = currentData.ageDistributionData.reduce((sum, item) => sum + item.count, 0);
  
  const totalDuration = currentData.workloadData.reduce((sum, item) => sum + item.count * item.avgDuration, 0);
  const averageConsultationDuration = totalPatients > 0 ? Math.round(totalDuration / totalPatients) : 0;

  // 导出CSV数据功能
  const exportToCSV = () => {
    // 创建CSV内容
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // 添加标题行
    csvContent += '数据类型,名称,数值,单位\n';
    
    // 添加概览数据
    csvContent += `概览,总接诊人数,${totalPatients},人\n`;
    csvContent += `概览,日均接诊,${averageDailyPatients},人\n`;
    csvContent += `概览,满意度,${overallSatisfaction}.0,分\n`;
    csvContent += `概览,平均咨询时长,${averageConsultationDuration},分钟\n`;
    csvContent += `概览,总收入,${totalIncome},元\n`;
    
    // 添加工作量数据
    csvContent += '\n工作量统计,日期,接诊人数,平均时长(分钟)\n';
    currentData.workloadData.forEach(item => {
      csvContent += `工作量,${item.date},${item.count},${item.avgDuration}\n`;
    });
    
    // 添加科室挂号数据
    csvContent += '\n科室挂号统计,科室名称,挂号人数,占比(%)\n';
    currentData.departmentData.forEach(item => {
      const percentage = totalDepartmentCount > 0 ? Math.round((item.count / totalDepartmentCount) * 100) : 0;
      csvContent += `科室,${item.name},${item.count},${percentage}\n`;
    });
    
    // 添加满意度数据
    csvContent += '\n患者满意度,评分,评价人数,占比(%)\n';
    currentData.satisfactionData.forEach(item => {
      const percentage = totalSatisfactionCount > 0 ? Math.round((item.count / totalSatisfactionCount) * 100) : 0;
      csvContent += `满意度,${item.rating}星,${item.count},${percentage}\n`;
    });
    
    // 添加收入数据
    csvContent += '\n收入统计,时间,收入金额,\n';
    currentData.incomeData.forEach(item => {
      csvContent += `收入,${item.month},${item.amount},\n`;
    });
    
    // 添加年龄分布数据
    csvContent += '\n患者年龄分布,年龄范围,人数,占比(%)\n';
    currentData.ageDistributionData.forEach(item => {
      const percentage = totalAgeCount > 0 ? Math.round((item.count / totalAgeCount) * 100) : 0;
      csvContent += `年龄分布,${item.ageRange}岁,${item.count},${percentage}\n`;
    });
    
    // 创建下载链接并触发下载
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `统计报表_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="statistics">
      <h1>统计报表</h1>
      
      {/* 错误信息展示 */}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <button 
            className="retry-btn"
            onClick={() => setTimeRange(timeRange)}
          >
            重试
          </button>
        </div>
      )}
      
      {/* 统计概览卡片 */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-title">总接诊人数</div>
            <div className="stat-value">
              {isLoading ? <div className="loading-skeleton"></div> : totalPatients}
            </div>
            <div className="stat-subtitle">人</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-title">日均接诊</div>
            <div className="stat-value">
              {isLoading ? <div className="loading-skeleton"></div> : averageDailyPatients}
            </div>
            <div className="stat-subtitle">人</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-title">满意度</div>
            <div className="stat-value">
              {isLoading ? <div className="loading-skeleton"></div> : `${overallSatisfaction}.0`}
            </div>
            <div className="stat-subtitle">分</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-title">平均咨询时长</div>
            <div className="stat-value">
              {isLoading ? <div className="loading-skeleton"></div> : averageConsultationDuration}
            </div>
            <div className="stat-subtitle">分钟</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-title">总收入</div>
            <div className="stat-value">
              {isLoading ? <div className="loading-skeleton"></div> : totalIncome.toLocaleString()}
            </div>
            <div className="stat-subtitle">元</div>
          </div>
        </div>
      </div>
      
      {/* 操作栏 */}
      <div className="operation-bar">
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
        
        {/* 导出按钮 */}
        <button 
          className="export-btn"
          onClick={() => exportToCSV()}
          disabled={isLoading || !!error}
        >
          导出CSV
        </button>
      </div>
      
      {/* 统计图表区域 */}
      <div className="charts-section">
        {isLoading ? (
          // 加载状态
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载数据...</div>
          </div>
        ) : (
          // 正常显示图表
          <>
            {/* 工作量统计 */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>工作量统计</h3>
              </div>
              <div className="chart-content">
                <div className="workload-chart">
                  {currentData.workloadData.map((item, index) => (
                    <div key={index} className="chart-bar-container">
                      <div className="chart-bar">
                        <div 
                            className="chart-bar-fill"
                            style={{ height: `${(() => {
                              const maxCount = Math.max(...currentData.workloadData.map(i => i.count));
                              return maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            })()}%` }}
                            onMouseEnter={(e) => handleTooltipShow(`${item.date}: ${item.count}人`, e)}
                            onMouseLeave={handleTooltipHide}
                          >
                          {/* 柱状图数据标签 */}
                          <div className="chart-bar-label">{item.count}</div>
                        </div>
                      </div>
                      <div className="chart-label">
                        {timeRange === 'day' ? item.date : 
                         timeRange === 'week' ? item.date : 
                         item.date.split('-').slice(1).join('-')}
                      </div>
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
              {currentData.departmentData.map((item, index) => (
                <div key={index} className="department-item">
                  <div className="department-info">
                    <div className="department-name">{item.name}</div>
                    <div className="department-count">{item.count} 人</div>
                  </div>
                  <div className="department-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${totalDepartmentCount > 0 ? Math.round((item.count / totalDepartmentCount) * 100) : 0}%` }}
                        onMouseEnter={(e) => handleTooltipShow(`${item.name}: ${item.count}人 (${totalDepartmentCount > 0 ? Math.round((item.count / totalDepartmentCount) * 100) : 0}%)`, e)}
                        onMouseLeave={handleTooltipHide}
                      ></div>
                    </div>
                    <div className="progress-text">{totalDepartmentCount > 0 ? Math.round((item.count / totalDepartmentCount) * 100) : 0}%</div>
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
              {currentData.satisfactionData.map((item, index) => (
                <div key={index} className="satisfaction-item">
                  <div className="satisfaction-info">
                    <div className="satisfaction-rating">{item.rating}星</div>
                    <div className="satisfaction-count">{item.count} 人</div>
                  </div>
                  <div className="satisfaction-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${totalSatisfactionCount > 0 ? Math.round((item.count / totalSatisfactionCount) * 100) : 0}%` }}
                        onMouseEnter={(e) => handleTooltipShow(`${item.rating}星评价: ${item.count}人 (${totalSatisfactionCount > 0 ? Math.round((item.count / totalSatisfactionCount) * 100) : 0}%)`, e)}
                        onMouseLeave={handleTooltipHide}
                      ></div>
                    </div>
                    <div className="progress-text">{totalSatisfactionCount > 0 ? Math.round((item.count / totalSatisfactionCount) * 100) : 0}%</div>
                  </div>
                </div>
              ))}
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
              {/* 收入折线图 */}
              <div 
                className="income-line-container"
                style={{
                  '--point-count': currentData.incomeData.length
                } as any}
              >
                <div className="income-line">
                  {currentData.incomeData.map((item, index) => {
                    const height = (item.amount / Math.max(...currentData.incomeData.map(i => i.amount))) * 100;
                    return (
                      <React.Fragment key={index}>
                        {/* 数据点 */}
                        <div 
                          className="income-point"
                          style={{ 
                            left: `${index * (100 / (currentData.incomeData.length - 1))}%`,
                            bottom: `${height}%` 
                          }}
                          onMouseEnter={(e) => handleTooltipShow(`${item.month}: ${item.amount}元`, e)}
                          onMouseLeave={handleTooltipHide}
                        ></div>
                      </React.Fragment>
                    );
                  })}
                </div>
                {/* 连接线 */}
                <div className="income-line-connect">
                  <svg 
                    className="income-line-svg"
                    style={{
                      position: 'absolute',
                      left: '0%',
                      bottom: '0%',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    } as any}
                  >
                    <path 
                      d={currentData.incomeData.map((item, index) => {
                        const height = (item.amount / Math.max(...currentData.incomeData.map(i => i.amount))) * 100;
                        const x = index * (100 / (currentData.incomeData.length - 1));
                        return `${index === 0 ? 'M' : 'L'} ${x}% ${100 - height}%`;
                      }).join(' ')}
                      stroke="#409eff" 
                      strokeWidth="2" 
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              
              {/* 收入标签 */}
              <div className="income-labels">
                {currentData.incomeData.map((item, index) => (
                  <div 
                    key={index} 
                    className="income-label"
                    style={{ left: `${index * (100 / (currentData.incomeData.length - 1))}%` }}
                  >
                    {timeRange === 'day' ? item.month.split('-').slice(1).join('-') : 
                     timeRange === 'week' ? item.month : 
                     item.month.split('-').slice(1).join('-')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 年龄分布统计 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>患者年龄分布</h3>
          </div>
          <div className="chart-content">
            <div className="age-distribution-chart">
              {currentData.ageDistributionData.map((item, index) => (
                <div key={index} className="age-item">
                  <div className="age-info">
                    <div className="age-range">{item.ageRange}岁</div>
                    <div className="age-count">{item.count} 人</div>
                  </div>
                  <div className="age-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${totalAgeCount > 0 ? Math.round((item.count / totalAgeCount) * 100) : 0}%` }}
                        onMouseEnter={(e) => handleTooltipShow(`${item.ageRange}岁: ${item.count}人 (${totalAgeCount > 0 ? Math.round((item.count / totalAgeCount) * 100) : 0}%)`, e)}
                        onMouseLeave={handleTooltipHide}
                      ></div>
                    </div>
                    <div className="progress-text">{totalAgeCount > 0 ? Math.round((item.count / totalAgeCount) * 100) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
  
  {/* Tooltip显示 */}
  {tooltip.visible && (
    <div 
      className="chart-tooltip show"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }}
    >
      {tooltip.content}
    </div>
  )}
</div>
);
}

export default Statistics;