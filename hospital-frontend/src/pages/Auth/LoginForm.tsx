import React, { useState } from "react";
import "../../mobile.css";

interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-card">
      <h2 className="auth-title">登录</h2>

      <input
        className="auth-input"
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onClick={() => alert("模拟登录成功")}
      >
        登录
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
