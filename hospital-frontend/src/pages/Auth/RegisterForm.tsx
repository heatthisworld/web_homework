import React, { useState } from "react";
import "../../mobile.css";
import { register } from "../../services/authService";

interface RegisterFormProps {
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>("MALE");
  const [age, setAge] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!username || !password || !confirm || !name || !age || !idCard || !phone || !address) {
      setError("请填写所有必填字段");
      return;
    }

    if (password !== confirm) {
      setError("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度不能少于6个字符");
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError("请输入有效的年龄");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register({
        username,
        password,
        role: 'PATIENT',
        name,
        gender,
        age: ageNum,
        idCard,
        phone,
        address
      });
      setSuccess("注册成功，请登录");
      // 重置表单
      setUsername("");
      setPassword("");
      setConfirm("");
      setName("");
      setGender("MALE");
      setAge("");
      setIdCard("");
      setPhone("");
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">注册</h2>
      <p className="auth-subtitle">仅支持患者注册</p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <input
        className="auth-input"
        type="text"
        placeholder="请输入用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="请再次输入密码"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <input
        className="auth-input"
        type="text"
        placeholder="请输入姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="auth-input"
        value={gender}
        onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
      >
        <option value="MALE">男</option>
        <option value="FEMALE">女</option>
      </select>

      <input
        className="auth-input"
        type="number"
        placeholder="请输入年龄"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        min="0"
        max="150"
      />

      <input
        className="auth-input"
        type="text"
        placeholder="请输入身份证号码"
        value={idCard}
        onChange={(e) => setIdCard(e.target.value)}
      />

      <input
        className="auth-input"
        type="tel"
        placeholder="请输入手机号码"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="auth-input"
        type="text"
        placeholder="请输入地址"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        className="auth-btn"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "注册中..." : "注册"}
      </button>

      <div className="switch-text">
        已有账号？
        <span className="switch-link" onClick={onSwitch}>
          去登录
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;