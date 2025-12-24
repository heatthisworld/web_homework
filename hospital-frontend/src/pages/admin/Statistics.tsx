import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminStats, fetchRegistrations } from "../../services/adminService";
import type { AdminRegistration, AdminStats } from "../../services/adminService";

interface MonthlyStat {
  month: string;
  registrations: number;
}

interface Ranking {
  name: string;
  department: string;
  registrations: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, regs] = await Promise.all([fetchAdminStats(), fetchRegistrations()]);
        setStats(s);
        setRegistrations(regs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthly: MonthlyStat[] = useMemo(() => {
    const now = new Date();
    const months: MonthlyStat[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = registrations.filter((r) => {
        if (!r.appointmentTime) return false;
        const rd = new Date(r.appointmentTime);
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
      }).length;
      months.push({
        month: `${d.getMonth() + 1}月`,
        registrations: count,
      });
    }
    return months;
  }, [registrations]);

  const totalRegistrations = monthly.reduce((sum, item) => sum + item.registrations, 0);
  const maxValue = Math.max(...monthly.map((m) => m.registrations), 1);

  const doctorRanking: Ranking[] = useMemo(() => {
    const map = new Map<string, { department: string; count: number }>();
    registrations.forEach((r) => {
      const name = r.doctor?.name ?? "未命名医生";
      const deptRaw = r.doctor?.department ?? r.disease?.department ?? "未分配";
      const dept = typeof deptRaw === "string" ? deptRaw : (deptRaw as any)?.name ?? "未分配";
      const current = map.get(name) || { department: dept, count: 0 };
      current.count += 1;
      map.set(name, current);
    });
    return Array.from(map.entries())
      .map(([name, info]) => ({
        name,
        department: info.department,
        registrations: info.count,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);
  }, [registrations]);

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
          <h1 className="page-heading">统计报表</h1>
          <p className="page-subtitle">挂号量趋势与医生表现，来自实时数据。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
          <button className="primary-button" type="button">
            导出报表
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-meta">
            <div className="stat-label">近 6 个月挂号总量</div>
            <div className="stat-value">{totalRegistrations.toLocaleString()}</div>
            <div className="stat-trend up">动态计算</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-meta">
            <div className="stat-label">科室覆盖</div>
            <div className="stat-value">{stats?.departmentCount ?? 0}</div>
            <div className="stat-trend up">按科室汇总</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-meta">
            <div className="stat-label">患者总数</div>
            <div className="stat-value">{stats?.totalPatients ?? 0}</div>
            <div className="stat-trend up">用户 {stats?.totalUsers ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="surface-card">
          <div className="table-actions">
            <h3 className="section-title">近 6 个月挂号趋势</h3>
            <span className="badge">客户端聚合</span>
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
            <span className="pill pill-info">按挂号量排名</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>医生</th>
                <th>科室</th>
                <th>挂号量</th>
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
