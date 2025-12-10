import React, { useState } from "react";
import "../../mobile.css";

interface RegisterFormProps {
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="auth-card">
      <h2 className="auth-title">注册</h2>

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

      <input
        className="auth-input"
        type="password"
        placeholder="请再次输入密码"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        className="auth-btn"
        onClick={() => {
          if (password !== confirm) {
            alert("两次密码不一致");
            return;
          }
          alert("模拟注册成功");
        }}
      >
        注册
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
