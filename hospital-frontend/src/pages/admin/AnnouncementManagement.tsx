import React, { useEffect, useMemo, useState } from "react";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../services/adminService";
import type { AdminAnnouncement } from "../../services/adminService";

type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

interface AnnouncementFormData {
  title: string;
  content: string;
  status: AnnouncementStatus;
  audienceScope: string;
  publishAt?: string;
}

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [statusFilter, setStatusFilter] = useState<"全部" | AnnouncementStatus>("全部");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    status: "DRAFT",
    audienceScope: "全院"
  });
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleOpenModal = (announcement?: AdminAnnouncement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content || "",
        status: announcement.status,
        audienceScope: announcement.audienceScope || "全院",
        publishAt: announcement.publishAt || undefined
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        status: "DRAFT",
        audienceScope: "全院"
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingAnnouncement) {
        // 更新公告
        const updated = await updateAnnouncement(editingAnnouncement.id, {
          ...formData,
          publishAt: formData.publishAt ? new Date(formData.publishAt) : undefined
        });
        setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        // 创建新公告
        const newAnnouncement = await createAnnouncement({
          ...formData,
          publishAt: formData.publishAt ? new Date(formData.publishAt) : undefined
        } as unknown as AdminAnnouncement);
        setAnnouncements(prev => [...prev, newAnnouncement]);
      }
      handleCloseModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("确定要删除这条公告吗？")) {
      try {
        await deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "删除失败");
      }
    }
  };

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
          <button className="primary-button" type="button" onClick={() => handleOpenModal()}>
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
                  {item.audienceScope ?? "全院"} ·{
                    item.publishAt
                      ? new Date(item.publishAt).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "待发布"
                  }
                </p>
                <p className="muted" style={{ fontSize: "14px", marginTop: "5px" }}>
                  {item.content?.substring(0, 100)}{item.content?.length > 100 ? "..." : ""}
                </p>
              </div>
              <div className="inline-list">
                <span className={`pill ${statusTone(item.status)}`}>{statusText(item.status)}</span>
                <span className="badge">ID {item.id}</span>
                <button 
                  className="primary-button" 
                  type="button"
                  style={{ marginLeft: "10px", padding: "5px 10px", fontSize: "12px" }}
                  onClick={() => handleOpenModal(item)}
                >
                  编辑
                </button>
                <button 
                  className="danger-button" 
                  type="button"
                  style={{ marginLeft: "5px", padding: "5px 10px", fontSize: "12px" }}
                  onClick={() => handleDelete(item.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="muted">暂无公告</p>}
        </div>
      </div>

      {/* 公告编辑/发布模态框 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingAnnouncement ? "编辑公告" : "发布公告"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <p className="error-message">{formError}</p>}
                
                <div className="form-group">
                  <label htmlFor="title">标题 *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">内容 *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    required
                    className="form-textarea"
                    rows={5}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">状态 *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="form-select"
                  >
                    <option value="DRAFT">草稿</option>
                    <option value="PUBLISHED">已发布</option>
                    <option value="SCHEDULED">预告</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="audienceScope">受众范围</label>
                  <input
                    type="text"
                    id="audienceScope"
                    name="audienceScope"
                    value={formData.audienceScope}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="publishAt">发布时间（可选）</label>
                  <input
                    type="datetime-local"
                    id="publishAt"
                    name="publishAt"
                    value={formData.publishAt}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="primary-button">
                  {editingAnnouncement ? "保存修改" : "发布公告"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框样式 */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          resize: vertical;
        }

        .error-message {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .primary-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .primary-button:hover {
          background-color: #0056b3;
        }

        .secondary-button {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .secondary-button:hover {
          background-color: #5a6268;
        }

        .danger-button {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .danger-button:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementManagement;
