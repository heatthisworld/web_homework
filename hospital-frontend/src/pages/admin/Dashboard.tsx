import React from "react";

const Dashboard: React.FC = () => {
  const metrics = [
    { label: "今日挂号", value: "163", trend: "+12%", direction: "up", detail: "线上 124 / 线下 39" },
    { label: "待分诊", value: "42", trend: "-8%", direction: "down", detail: "高优先 9 · 普通 33" },
    { label: "在岗医生", value: "68", trend: "+3人", direction: "up", detail: "12 个科室值班中" },
    { label: "公告触达", value: "92%", trend: "+5%", direction: "up", detail: "近 24 小时阅读率" },
  ];

  const scheduleToday = [
    { time: "09:00", doctor: "王磊（内科）", type: "普通号", slots: "12 / 18", status: "进行中" },
    { time: "10:00", doctor: "林静（儿科）", type: "专家号", slots: "满号", status: "满额" },
    { time: "11:00", doctor: "陈思（外科）", type: "加号", slots: "6 / 12", status: "开放中" },
    { time: "14:00", doctor: "李言（眼科）", type: "普通号", slots: "3 / 10", status: "待开始" },
  ];

  const departmentHeat = [
    { name: "内科", rate: 86, delta: "+6%", highlight: "慢病复诊高峰" },
    { name: "儿科", rate: 78, delta: "+3%", highlight: "疫苗咨询增多" },
    { name: "外科", rate: 64, delta: "-4%", highlight: "择期手术调整" },
    { name: "眼科", rate: 52, delta: "+2%", highlight: "上午号源紧张" },
  ];

  const liveFeed = [
    { time: "08:55", text: "血透中心开启晨会，更新感染防控提示", tag: "提醒" },
    { time: "09:05", text: "李言医生（眼科）开启 10:00 专家门诊候诊", tag: "排班" },
    { time: "09:20", text: "新增公告《冬季流感接诊指引》已发布", tag: "公告" },
    { time: "09:40", text: "儿科疫苗咨询量上升，系统自动扩容 6 个号源", tag: "调度" },
  ];

  const announcements = [
    { title: "冬季流感接诊指引", status: "已发布", window: "今日 09:00", impact: "覆盖 6 个科室" },
    { title: "急诊绿色通道演练", status: "预告", window: "明日 14:00", impact: "需儿科、骨科参与" },
    { title: "夜间值班临时调整", status: "草稿", window: "待确认", impact: "主管审核中" },
  ];

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">仪表盘</h1>
          <p className="page-subtitle">掌握今日挂号、排班与公告动态，默认载入一张仪表盘标签。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            快速刷新
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {metrics.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-icon">◎</div>
            <div className="stat-meta">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              <div className={`stat-trend ${item.direction === "up" ? "up" : "down"}`}>
                {item.trend} · {item.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="split-grid">
        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">今日排班 / 挂号速览</h3>
            <span className="badge">
              {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>医生 / 科室</th>
                <th>号源类型</th>
                <th>占用</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {scheduleToday.map((row) => (
                <tr key={row.time}>
                  <td>{row.time}</td>
                  <td>{row.doctor}</td>
                  <td>
                    <span className="pill pill-info">{row.type}</span>
                  </td>
                  <td>{row.slots}</td>
                  <td>
                    <span
                      className={`pill ${
                        row.status === "满额"
                          ? "pill-warning"
                          : row.status === "进行中"
                          ? "pill-success"
                          : "pill-muted"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">实时动态</h3>
            <span className="pill pill-outline">近 1 小时</span>
          </div>
          <div className="timeline">
            {liveFeed.map((item) => (
              <div key={item.time + item.text} className="timeline-item">
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-content">
                  <div className="inline-list">
                    <span className="pill pill-neutral">{item.tag}</span>
                    <span>{item.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">高峰科室 & 负载</h3>
            <span className="pill pill-muted">滚动统计</span>
          </div>
          <div className="list-grid">
            {departmentHeat.map((dept) => (
              <div key={dept.name} className="card-item">
                <div className="table-actions">
                  <strong>{dept.name}</strong>
                  <span className="badge">
                    {dept.rate}% · <span className="trend-up">{dept.delta}</span>
                  </span>
                </div>
                <p className="muted">{dept.highlight}</p>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${dept.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">公告 & 应急提醒</h3>
            <span className="pill pill-info">同步至公告管理</span>
          </div>
          <div className="announcement-list">
            {announcements.map((item) => (
              <div key={item.title} className="announcement-card">
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">
                    {item.window} · {item.impact}
                  </p>
                </div>
                <span
                  className={`pill ${
                    item.status === "已发布"
                      ? "pill-success"
                      : item.status === "预告"
                      ? "pill-info"
                      : "pill-warning"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
