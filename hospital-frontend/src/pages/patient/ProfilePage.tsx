import React, { useEffect, useState } from "react";
import "./patient.css";
import {
  fetchCurrentPatientDetails,
  updatePatientProfile,
  type PatientDetails,
} from "../../services/patientService";

interface ProfilePageProps {
  debugMode: boolean;
}

const mockUser: PatientDetails = {
  id: 0,
  username: "patient@example.com",
  name: "张三",
  gender: "MALE",
  age: 35,
  phone: "138****1234",
  address: "北京市朝阳区朝阳北路123号",
  medicalHistory: [],
  visitHistory: [],
};

const ProfilePage: React.FC<ProfilePageProps> = ({ debugMode }) => {
  const [userInfo, setUserInfo] = useState<PatientDetails>(mockUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "MALE" as "MALE" | "FEMALE",
    age: 0,
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (debugMode) {
        setUserInfo(mockUser);
        setForm({
          name: mockUser.name || "",
          gender: mockUser.gender || "MALE",
          age: mockUser.age || 0,
          phone: mockUser.phone || "",
          address: mockUser.address || "",
        });
        setLoading(false);
        return;
      }
      try {
        const detail = await fetchCurrentPatientDetails();
        if (cancelled) return;
        setUserInfo(detail);
        setForm({
          name: detail.name || "",
          gender: detail.gender || "MALE",
          age: detail.age || 0,
          phone: detail.phone || "",
          address: detail.address || "",
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? `${err.message}，已显示示例数据` : "加载失败，已显示示例数据",
        );
        setUserInfo(mockUser);
        setForm({
          name: mockUser.name || "",
          gender: mockUser.gender || "MALE",
          age: mockUser.age || 0,
          phone: mockUser.phone || "",
          address: mockUser.address || "",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [debugMode]);

  const onSave = async () => {
    if (debugMode) {
      setUserInfo({ ...userInfo, ...form });
      setEditing(false);
      setMessage("已保存（调试模式，仅本地）");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setMessage("");
      setError("");
      await updatePatientProfile(userInfo.id, {
        name: form.name,
        age: form.age,
        phone: form.phone,
        address: form.address,
      });
      setUserInfo({ ...userInfo, ...form });
      setEditing(false);
      setMessage("保存成功");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="profile-page patient-page">
        <div className="announcement-item">正在加载，请稍候...</div>
      </div>
    );
  }

  return (
    <div className="profile-page patient-page">
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {/* 用户信息卡片 */}
      <div className="user-info-card">
        <img
          src="/src/assets/Defaulthead.png"
          alt="用户头像"
          className="user-avatar"
        />
        <div className="user-info">
          <h3>{userInfo.name}</h3>
          <p>患者ID: {userInfo.id}</p>
          <p>
            {userInfo.gender === "MALE" ? "男" : "女"} | {userInfo.age ?? "-"}岁
          </p>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="detail-info">
        <div className="info-item">
          <span className="info-label">姓名:</span>
          {editing ? (
            <input
              className="auth-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          ) : (
            <span className="info-value">{userInfo.name}</span>
          )}
        </div>
        <div className="info-item">
          <span className="info-label">性别:</span>
          {editing ? (
            <select
              className="auth-input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as "MALE" | "FEMALE" })}
            >
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
            </select>
          ) : (
            <span className="info-value">{userInfo.gender === "MALE" ? "男" : "女"}</span>
          )}
        </div>
        <div className="info-item">
          <span className="info-label">年龄:</span>
          {editing ? (
            <input
              type="number"
              className="auth-input"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
            />
          ) : (
            <span className="info-value">{userInfo.age}</span>
          )}
        </div>
        <div className="info-item">
          <span className="info-label">手机号:</span>
          {editing ? (
            <input
              className="auth-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          ) : (
            <span className="info-value">{userInfo.phone}</span>
          )}
        </div>
        <div className="info-item">
          <span className="info-label">联系地址:</span>
          {editing ? (
            <input
              className="auth-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          ) : (
            <span className="info-value">{userInfo.address}</span>
          )}
        </div>
      </div>

      <div className="menu-section">
        <h4>操作</h4>
        <div className="menu-list">
          <div className="menu-item">
            <div className="menu-icon">📝</div>
            <div className="menu-label">编辑信息</div>
            <div className="menu-arrow">
              <button className="auth-btn" onClick={() => setEditing(!editing)}>
                {editing ? "取消" : "编辑"}
              </button>
            </div>
          </div>
          {editing && (
            <div className="menu-item">
              <div className="menu-icon">💾</div>
              <div className="menu-label">保存更改</div>
              <div className="menu-arrow">
                <button className="auth-btn" onClick={onSave}>
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
