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
  phone: "13800001234",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateField = (name: string, value: string | number) => {
    switch (name) {
      case "name":
        if (!value) return "姓名不能为空";
        if (String(value).length > 50) return "姓名最多50个字符";
        return "";
      case "age":
        const age = Number(value);
        if (isNaN(age) || age < 0 || age > 150) return "请输入有效年龄(0-150)";
        return "";
      case "phone":
        if (!value) return "手机号不能为空";
        const phoneStr = String(value);
        if (phoneStr.length !== 11) return "手机号必须为11位";
        if (!/^1[3-9]\d{9}$/.test(phoneStr)) return "手机号格式不正确";
        return "";
      case "address":
        if (String(value).length > 200) return "地址最多200个字符";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let filteredValue: string | number = value;
    if (name === "phone") {
      filteredValue = value.replace(/\D/g, "").slice(0, 11);
    } else if (name === "age") {
      filteredValue = parseInt(value.replace(/\D/g, "").slice(0, 3)) || 0;
    } else if (name === "name") {
      filteredValue = value.slice(0, 50);
    } else if (name === "address") {
      filteredValue = value.slice(0, 200);
    }

    setForm({ ...form, [name]: filteredValue });

    const error = validateField(name, filteredValue);
    setErrors({ ...errors, [name]: error });
  };

  const onSave = async () => {
    const newErrors: Record<string, string> = {};
    ["name", "age", "phone", "address"].forEach((key) => {
      const error = validateField(key, form[key as keyof typeof form]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("请修正表单错误");
      setTimeout(() => setError(""), 3000);
      return;
    }

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

      {/* 基本资料 */}
      <div className="info-section">
        <h4 className="section-title">基本资料</h4>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">姓名:</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input
                  className="info-input"
                  value={form.name}
                  onChange={handleChange}
                  name="name"
                  maxLength={50}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
            ) : (
              <span className="info-value">{userInfo.name}</span>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">性别:</span>
            {editing ? (
              <select
                className="info-input"
                value={form.gender}
                onChange={handleChange}
                name="gender"
              >
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
              </select>
            ) : (
              <span className="info-value">{userInfo.gender === "MALE" ? "男" : "女"}</span>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">年龄:</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input
                  type="text"
                  className="info-input"
                  value={form.age || ""}
                  onChange={handleChange}
                  name="age"
                  placeholder="0-150"
                />
                {errors.age && <div className="field-error">{errors.age}</div>}
              </div>
            ) : (
              <span className="info-value">{userInfo.age}</span>
            )}
          </div>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="info-section">
        <h4 className="section-title">联系方式</h4>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">手机号:</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input
                  type="text"
                  className="info-input"
                  value={form.phone}
                  onChange={handleChange}
                  name="phone"
                  placeholder="11位手机号"
                  maxLength={11}
                />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>
            ) : (
              <span className="info-value">{userInfo.phone}</span>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">联系地址:</span>
            {editing ? (
              <div className="info-input-wrapper">
                <input
                  className="info-input"
                  value={form.address}
                  onChange={handleChange}
                  name="address"
                  placeholder="最多200字符"
                  maxLength={200}
                />
                {errors.address && <div className="field-error">{errors.address}</div>}
              </div>
            ) : (
              <span className="info-value">{userInfo.address}</span>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="action-buttons">
        {editing ? (
          <>
            <button className="primary-btn" onClick={onSave}>
              保存
            </button>
            <button className="secondary-btn" onClick={() => setEditing(false)}>
              取消
            </button>
          </>
        ) : (
          <button className="primary-btn" onClick={() => setEditing(true)}>
            编辑信息
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
