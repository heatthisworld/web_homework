import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../mobile.css";
import { login, saveUserInfo } from "../../services/authService";

interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({ username, password });
      saveUserInfo(response);

      // 根据角色跳转到对应页面
      switch (response.role) {
        case "DOCTOR":
          navigate("/doctor/dashboard");
          break;
        case "PATIENT":
          navigate("/patient/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">登录</h2>

      {error && <div className="auth-error">{error}</div>}

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

      <button
        className="auth-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "登录中..." : "登录"}
      </button>

      <div className="switch-text">
        还没有账号？
        <span className="switch-link" onClick={onSwitch}>
          注册
        </span>
      </div>
    </div>
  );
};

export default LoginForm;
