import React from "react";

interface MonthlyStat {
  month: string;
  registrations: number;
  revenue: number;
  satisfaction: number;
}

interface Ranking {
  name: string;
  department: string;
  registrations: number;
  satisfaction: number;
}

const Statistics: React.FC = () => {
  const monthly: MonthlyStat[] = [
    { month: "7月", registrations: 3420, revenue: 482000, satisfaction: 96 },
    { month: "8月", registrations: 3688, revenue: 501200, satisfaction: 95 },
    { month: "9月", registrations: 3890, revenue: 528400, satisfaction: 97 },
    { month: "10月", registrations: 4122, revenue: 556600, satisfaction: 96 },
    { month: "11月", registrations: 4310, revenue: 579200, satisfaction: 97 },
    { month: "12月", registrations: 4568, revenue: 612800, satisfaction: 98 },
  ];

  const doctorRanking: Ranking[] = [
    { name: "王磊", department: "内科", registrations: 486, satisfaction: 98 },
    { name: "林静", department: "儿科", registrations: 452, satisfaction: 97 },
    { name: "陈思", department: "外科", registrations: 368, satisfaction: 95 },
    { name: "李言", department: "眼科", registrations: 310, satisfaction: 96 },
    { name: "张驰", department: "骨科", registrations: 288, satisfaction: 94 },
  ];

  const totalRegistrations = monthly.reduce((sum, item) => sum + item.registrations, 0);
  const totalRevenue = monthly.reduce((sum, item) => sum + item.revenue, 0);
  const avgSatisfaction = Math.round(
    monthly.reduce((sum, item) => sum + item.satisfaction, 0) / monthly.length
  );

  const maxValue = Math.max(...monthly.map((m) => m.registrations));

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">统计报表</h1>
          <p className="page-subtitle">挂号量、收入与满意度的趋势概览，适合标签页对比查看。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            导出报表
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-meta">
            <div className="stat-label">半年挂号总量</div>
            <div className="stat-value">{totalRegistrations.toLocaleString()}</div>
            <div className="stat-trend up">环比 +7.8%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-meta">
            <div className="stat-label">半年收入</div>
            <div className="stat-value">¥{totalRevenue.toLocaleString()}</div>
            <div className="stat-trend up">诊疗覆盖率 94%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👍</div>
          <div className="stat-meta">
            <div className="stat-label">平均满意度</div>
            <div className="stat-value">{avgSatisfaction}%</div>
            <div className="stat-trend up">比上一周期 +2%</div>
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">近 6 个月挂号趋势</h3>
            <span className="badge">柱状模拟</span>
          </div>
          <div className="bar-chart">
            {monthly.map((item) => (
              <div key={item.month} className="bar-chart-item">
                <div className="bar-chart-label">{item.month}</div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.registrations / maxValue) * 100}%` }}
                  />
                </div>
                <div className="bar-chart-value">
                  {item.registrations.toLocaleString()} 次
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">医生表现榜</h3>
            <span className="pill pill-info">含满意度</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>医生</th>
                <th>科室</th>
                <th>挂号量</th>
                <th>满意度</th>
              </tr>
            </thead>
            <tbody>
              {doctorRanking.map((item, index) => (
                <tr key={item.name}>
                  <td>
                    #{index + 1} {item.name}
                  </td>
                  <td>{item.department}</td>
                  <td>{item.registrations}</td>
                  <td>
                    <span className="pill pill-success">{item.satisfaction}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
