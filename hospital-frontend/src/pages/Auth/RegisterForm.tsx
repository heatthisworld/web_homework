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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!username || !password || !confirm) {
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

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register({ username, password, role: 'PATIENT' });
      setSuccess("注册成功，请登录");
      // 重置表单
      setUsername("");
      setPassword("");
      setConfirm("");
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