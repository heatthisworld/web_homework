import React, { useState, useEffect } from "react";
import "./patient.css";
import { updatePatientProfile } from "../../services/patientService";
import { usePatient } from "../../contexts/PatientContext";

interface ProfilePageProps {
  onLogout?: () => void;
}

// Toast 提示组件
interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose, duration = 3000 }) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className={`toast toast-${type} ${isHiding ? 'hiding' : ''}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
};

// 确认模态框组件
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, onConfirm, onCancel, confirmText = "确定", cancelText = "取消", type = 'primary', isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">{type === 'danger' ? '⚠️' : '❓'}</div>
          <h4>{title}</h4>
        </div>
        <div className="confirm-modal-body">{message}</div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-btn" onClick={onCancel} disabled={isLoading}>{cancelText}</button>
          <button className={`confirm-modal-btn ${type}`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "处理中..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { patient, loading, refreshPatient, updateLocalPatient } = usePatient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", gender: "MALE" as "MALE" | "FEMALE", age: 0, phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast 状态
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

  // 退出登录确认模态框状态
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || "",
        gender: patient.gender || "MALE",
        age: patient.age || 0,
        phone: patient.phone || "",
        address: patient.address || ""
      });
    }
  }, [patient]);

  const validateField = (name: string, value: string | number) => {
    switch (name) {
      case "name": return !value ? "姓名不能为空" : String(value).length > 50 ? "姓名最多50个字符" : "";
      case "age": return isNaN(Number(value)) || Number(value) < 0 || Number(value) > 150 ? "请输入有效年龄(0-150)" : "";
      case "phone": return !value ? "手机号不能为空" : String(value).length !== 11 ? "手机号必须为11位" : !/^1[3-9]\d{9}$/.test(String(value)) ? "手机号格式不正确" : "";
      case "address": return String(value).length > 200 ? "地址最多200个字符" : "";
      default: return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let filteredValue: string | number = value;

    if (name === "phone") filteredValue = value.replace(/\D/g, "").slice(0, 11);
    else if (name === "age") filteredValue = parseInt(value.replace(/\D/g, "").slice(0, 3)) || 0;
    else if (name === "name") filteredValue = value.slice(0, 50);
    else if (name === "address") filteredValue = value.slice(0, 200);

    setForm({ ...form, [name]: filteredValue });
    setErrors({ ...errors, [name]: validateField(name, filteredValue) });
  };

  const onSave = async () => {
    const newErrors: Record<string, string> = {};
    ["name", "age", "phone", "address"].forEach((key) => {
      const error = validateField(key, form[key as keyof typeof form]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('error', '保存失败', '请修正表单中的错误');
      return;
    }

    if (!patient) return;

    try {
      await updatePatientProfile(patient.id, { name: form.name, gender: form.gender, age: form.age, phone: form.phone, address: form.address });
      updateLocalPatient({ name: form.name, gender: form.gender, age: form.age, phone: form.phone, address: form.address });
      await refreshPatient();
      setEditing(false);
      showToast('success', '保存成功', '个人信息已更新');
    } catch (err) {
      showToast('error', '保存失败', err instanceof Error ? err.message : "保存失败");
    }
  };

  // 显示退出确认模态框
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // 确认退出登录
  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      // 显示退出中的提示
      showToast('info', '正在退出', '正在安全退出登录...');
      setShowLogoutConfirm(false);

      // 延迟执行退出，让用户看到提示
      setTimeout(() => {
        onLogout?.();
      }, 500);
    } catch (err) {
      showToast('error', '退出失败', err instanceof Error ? err.message : "退出登录失败");
      setLogoutLoading(false);
    }
  };

  // 取消退出登录
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) return <div className="profile-page patient-page"><div className="announcement-item">正在加载，请稍候...</div></div>;
  if (!patient) return <div className="profile-page patient-page"><div className="error-container">未获取到患者信息</div></div>;

  return (
    <div className="profile-page patient-page">
      {/* Toast 提示 */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

        {/* 用户信息卡片 - 与首页布局完全一致 */}
        <div className="user-info-card">
            <img src="/src/assets/Defaulthead.png" alt="用户头像" className="user-avatar" />
            <div className="user-info">
                <h3>{patient.name || "未命名"}</h3>
                <p className="user-detail">{patient.gender === "MALE" ? "男" : "女"} | {patient.age || "-"}岁</p>
                <p className="user-detail">手机号: {patient.phone || "-"}</p>
            </div>
        </div>

      <div className="info-section">
        <div className="section-header">
          <h4 className="section-title">我的资料</h4>
          {!editing && (
            <button className="edit-icon-btn" onClick={() => setEditing(true)}>✏️ 编辑</button>
          )}
        </div>
        <div className="info-list">
          {/* 添加用户名显示（只读） */}
          <div className="info-row">
            <span className="info-label">用户名</span>
            <span className="info-value">{patient.username || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">姓名</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input className="info-input" value={form.name} onChange={handleChange} name="name" maxLength={50} placeholder="请输入姓名" />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
            ) : <span className="info-value">{patient.name}</span>}
          </div>
          <div className="info-row">
            <span className="info-label">性别</span>
            {editing ? (
              <select className="info-input" value={form.gender} onChange={handleChange} name="gender">
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
              </select>
            ) : <span className="info-value">{patient.gender === "MALE" ? "男" : "女"}</span>}
          </div>
          <div className="info-row">
            <span className="info-label">年龄</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input type="text" className="info-input" value={form.age || ""} onChange={handleChange} name="age" placeholder="请输入年龄" />
                {errors.age && <div className="field-error">{errors.age}</div>}
              </div>
            ) : <span className="info-value">{patient.age}</span>}
          </div>
          <div className="info-row">
            <span className="info-label">手机号</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input type="text" className="info-input" value={form.phone} onChange={handleChange} name="phone" placeholder="请输入手机号" maxLength={11} />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>
            ) : <span className="info-value">{patient.phone}</span>}
          </div>
          <div className="info-row">
            <span className="info-label">联系地址</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input className="info-input" value={form.address} onChange={handleChange} name="address" placeholder="请输入地址" maxLength={200} />
                {errors.address && <div className="field-error">{errors.address}</div>}
              </div>
            ) : <span className="info-value">{patient.address}</span>}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        {editing ? (
          <>
            <button className="primary-btn" onClick={onSave}>保存</button>
            <button className="secondary-btn" onClick={() => setEditing(false)}>取消</button>
          </>
        ) : (
          <button className="secondary-btn logout-btn" onClick={handleLogoutClick}>安全退出</button>
        )}
      </div>

      {/* 退出登录确认模态框 */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="确认退出"
        message="确定要退出登录吗？退出后需要重新登录才能使用系统。"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmText="确定退出"
        cancelText="取消"
        type="danger"
        isLoading={logoutLoading}
      />
    </div>
  );
};

export default ProfilePage;