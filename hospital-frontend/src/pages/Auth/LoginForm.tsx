import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../mobile.css";
import {
  debugLogin,
  fetchCurrentUser,
  login,
  saveUserInfo,
  type LoginResponse,
} from "../../services/authService";

interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const redirectByRole = (role: LoginResponse["role"]) => {
    switch (role) {
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
        navigate("/");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const tryAutoLogin = async () => {
      try {
        const user = await fetchCurrentUser();
        if (cancelled) {
          return;
        }
        saveUserInfo(user);
        redirectByRole(user.role);
      } catch {
        // ignore auto-login failure and keep form visible
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    };

    tryAutoLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = debugMode
        ? await debugLogin({ username, password })
        : await login({ username, password });
      saveUserInfo(response);
      redirectByRole(response.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
      setCheckingSession(false);
    }
  };

  const isBusy = loading || checkingSession;

  return (
    <div className="auth-card">
      <h2 className="auth-title">登录</h2>

      {error && <div className="auth-error">{error}</div>}
      {checkingSession && !loading && !error && (
        <div className="auth-hint">自动登录中，请稍候...</div>
      )}

      <input
        className="auth-input"
        type="text"
        placeholder="请输入用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isBusy}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isBusy}
      />

      <label className="debug-checkbox">
        <input
          type="checkbox"
          checked={debugMode}
          onChange={(e) => setDebugMode(e.target.checked)}
          disabled={isBusy}
        />
        <span>Debug 登录（使用 /api/debug/login）</span>
      </label>

      <button className="auth-btn" onClick={handleLogin} disabled={isBusy}>
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
