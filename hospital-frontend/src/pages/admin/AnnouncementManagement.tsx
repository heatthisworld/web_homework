import React from "react";

type AnnouncementStatus = "草稿" | "已发布" | "预告";

interface Announcement {
  id: number;
  title: string;
  status: AnnouncementStatus;
  audience: string;
  publishTime: string;
  owner: string;
}

const AnnouncementManagement: React.FC = () => {
  const announcements: Announcement[] = [
    { id: 1, title: "冬季流感接诊指引", status: "已发布", audience: "全院 · 6 科室", publishTime: "今天 09:00", owner: "陆晚舟" },
    { id: 2, title: "急诊绿色通道演练", status: "预告", audience: "儿科、骨科", publishTime: "明天 14:00", owner: "陈俊" },
    { id: 3, title: "夜间值班临时调整", status: "草稿", audience: "内科、外科", publishTime: "待确认", owner: "沈意" },
    { id: 4, title: "设备巡检计划", status: "已发布", audience: "全院", publishTime: "昨天 16:30", owner: "王若初" },
  ];

  const statusTone = (status: AnnouncementStatus) => {
    if (status === "已发布") return "pill-success";
    if (status === "预告") return "pill-info";
    return "pill-warning";
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">公告管理</h1>
          <p className="page-subtitle">在标签页里维护公告，和仪表盘联动展示触达进度。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            发布公告
          </button>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">公告列表</h3>
          <span className="badge">点击侧栏可新建标签页</span>
        </div>

        <div className="announcement-list">
          {announcements.map((item) => (
            <div key={item.id} className="announcement-card">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">
                  {item.audience} · {item.publishTime}
                </p>
              </div>
              <div className="inline-list">
                <span className={`pill ${statusTone(item.status)}`}>{item.status}</span>
                <span className="badge">负责人 {item.owner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManagement;
