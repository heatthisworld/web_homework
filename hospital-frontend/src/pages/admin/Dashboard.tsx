import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminStats, fetchAnnouncements } from "../../services/adminService";
import type { AdminAnnouncement, AdminStats } from "../../services/adminService";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, annRes] = await Promise.all([
        fetchAdminStats(),
        fetchAnnouncements().catch(() => [])
      ]);
      setStats(statsRes);
      setAnnouncements(annRes);
    } catch (e) {
      setError(`数据加载失败: ${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const computedMetrics = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "今日挂号",
        value: stats.todayRegistrations.toString(),
        trend: "+",
        detail: `本月累计 ${stats.monthRegistrations}`,
      },
      {
        label: "在岗医生",
        value: stats.totalDoctors.toString(),
        trend: "+",
        detail: `科室 ${stats.departmentCount}`,
      },
      {
        label: "患者总数",
        value: stats.totalPatients.toString(),
        trend: "",
        detail: `用户 ${stats.totalUsers}`,
      },
      {
        label: "病种覆盖",
        value: stats.totalDiseases.toString(),
        trend: "",
        detail: "疾病库总量",
      },
    ];
  }, [stats]);

  const departmentHeat = useMemo(() => {
    if (!stats?.registrationByDepartment?.length) return [];
    const max = Math.max(...stats.registrationByDepartment.map((d) => d.count));
    return stats.registrationByDepartment.map((d) => ({
      name: d.department || "未分配科室",
      rate: max ? Math.round((d.count / max) * 100) : 0,
      delta: "",
      highlight: `挂号量 ${d.count}`,
    }));
  }, [stats]);

  const recentActivities = useMemo(() => {
    if (!stats?.recentRegistrations) return [];
    return stats.recentRegistrations.slice(0, 5).map((r) => ({
      time: r.appointmentTime
        ? new Date(r.appointmentTime).toLocaleString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            month: "2-digit",
            day: "2-digit",
          })
        : "--",
      text: `${r.patientName ?? "患者"} 预约 ${
        r.doctorName ?? "医生"
      } (${r.department ?? "科室"})`,
      tag: r.status ?? "状态",
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="page-root">
        <p className="muted">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-root">
        <p className="muted">加载失败：{error}</p>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">仪表盘</h1>
          <p className="page-subtitle">掌握今日挂号、排班与公告动态，默认载入一张仪表盘标签。</p>
        </div>
        <div className="page-actions">
          <span className={`pill ${stats ? 'pill-success' : 'pill-muted'}`}>
            {stats ? '实时数据' : '加载中...'}
          </span>
          <button className="primary-button" type="button" onClick={loadData}>
            快速刷新
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {computedMetrics.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-meta">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-trend up">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="split-grid">
        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">挂号按科室</h3>
            <span className="badge">
              {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
            </span>
          </div>
          <div className="list-grid">
            {departmentHeat.length === 0 && <p className="muted">暂无数据</p>}
            {departmentHeat.map((dept) => (
              <div key={dept.name} className="card-item">
                <div className="table-actions">
                  <strong>{dept.name}</strong>
                  <span className="badge">{dept.highlight}</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${dept.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">近期挂号动态</h3>
            <span className="pill pill-outline">最新 5 条</span>
          </div>
          <div className="timeline">
            {recentActivities.length === 0 && <p className="muted">暂无记录</p>}
            {recentActivities.map((item) => (
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

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">公告播报</h3>
          <span className="pill pill-info">来源：公告管理</span>
        </div>
        <div className="announcement-list">
          {announcements.length === 0 && <p className="muted">暂无公告</p>}
          {announcements.map((item) => (
            <div key={item.id} className="announcement-card">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">
                  {item.audienceScope ?? "全院"} ·{" "}
                  {item.publishAt
                    ? new Date(item.publishAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                    : "待发布"}
                </p>
              </div>
              <span
                className={`pill ${
                  item.status === "PUBLISHED"
                    ? "pill-success"
                    : item.status === "SCHEDULED"
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
  );
};

export default Dashboard;
