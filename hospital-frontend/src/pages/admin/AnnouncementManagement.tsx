import React, { useEffect, useMemo, useState } from "react";
import { fetchAnnouncements } from "../../services/adminService";
import type { AdminAnnouncement } from "../../services/adminService";

type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [statusFilter, setStatusFilter] = useState<"全部" | AnnouncementStatus>("全部");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const byStatus = statusFilter === "全部" ? true : item.status === statusFilter;
      const byKeyword = keyword
        ? [item.title, item.audienceScope ?? "", item.content ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return byStatus && byKeyword;
    });
  }, [announcements, statusFilter, keyword]);

  const statusTone = (status: AnnouncementStatus) => {
    if (status === "PUBLISHED") return "pill-success";
    if (status === "SCHEDULED") return "pill-info";
    return "pill-warning";
  };

  const statusText = (status: AnnouncementStatus) =>
    status === "PUBLISHED" ? "已发布" : status === "SCHEDULED" ? "预告" : "草稿";

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
          <h1 className="page-heading">公告管理</h1>
          <p className="page-subtitle">在标签页里维护公告，和仪表盘联动展示触达进度。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">实时数据</span>
          <button className="primary-button" type="button">
            发布公告
          </button>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">公告列表</h3>
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">状态</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="全部">全部</option>
                <option value="PUBLISHED">已发布</option>
                <option value="SCHEDULED">预告</option>
                <option value="DRAFT">草稿</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">搜索</span>
              <input
                className="filter-input"
                placeholder="标题/受众/内容"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <span className="filter-chip">结果 {filtered.length}</span>
          </div>
        </div>

        <div className="announcement-list">
          {filtered.map((item) => (
            <div key={item.id} className="announcement-card">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">
                  {item.audienceScope ?? "全院"} ·{" "}
                  {item.publishAt
                    ? new Date(item.publishAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "待发布"}
                </p>
              </div>
              <div className="inline-list">
                <span className={`pill ${statusTone(item.status)}`}>{statusText(item.status)}</span>
                <span className="badge">ID {item.id}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="muted">暂无公告</p>}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManagement;
