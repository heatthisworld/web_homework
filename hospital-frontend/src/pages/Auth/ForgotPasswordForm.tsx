import React, { useEffect, useState } from "react";
import "../../mobile.css";
import {
  resetPassword,
  sendResetCode,
  type ResetPasswordRequest,
  type SendResetCodeRequest,
} from "../../services/authService";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSwitchToRegister?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onSwitchToRegister,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const validateBaseInfo = () => {
    if (!username || !email) {
      setError("请填写用户名和邮箱");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("请输入正确的邮箱地址");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendCode = async () => {
    if (!validateBaseInfo()) {
      return;
    }

    const payload: SendResetCodeRequest = { username, email };
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await sendResetCode(payload);
      setCodeSent(true);
      setSuccess("验证码已发送到邮箱，请查收");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    if (!validateBaseInfo()) {
      return;
    }
    if (!codeSent) {
      setError("请先获取验证码");
      return;
    }
    if (!code.trim()) {
      setError("请输入验证码");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("新密码长度不能少于6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    const payload: ResetPasswordRequest = {
      username,
      email,
      code,
      newPassword,
    };
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await resetPassword(payload);
      setSuccess("密码重置成功，请使用新密码登录");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setCodeSent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "重置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">找回密码</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <input
        className="auth-input"
        type="text"
        placeholder="请输入用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading || sending}
      />
      <input
        className="auth-input"
        type="email"
        placeholder="请输入绑定邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || sending}
      />

      <div className="auth-row">
        <input
          className="auth-input"
          type="text"
          placeholder="请输入验证码"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        <button
          className="auth-btn secondary"
          onClick={handleSendCode}
          disabled={sending || countdown > 0 || loading}
        >
          {countdown > 0 ? `重新发送(${countdown}s)` : "发送验证码"}
        </button>
      </div>

      <input
        className="auth-input"
        type="password"
        placeholder="请输入新密码"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={loading}
      />
      <input
        className="auth-input"
        type="password"
        placeholder="请再次输入新密码"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />

      <button className="auth-btn" onClick={handleReset} disabled={loading}>
        {loading ? "提交中..." : "确认重置"}
      </button>

      <div className="switch-text">
        想起密码了？
        <span className="switch-link" onClick={onBackToLogin}>
          返回登录
        </span>
      </div>
      {onSwitchToRegister && (
        <div className="switch-text">
          还没有账号？
          <span className="switch-link" onClick={onSwitchToRegister}>
            立即注册
          </span>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
