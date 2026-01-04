import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import "../../mobile.css";

type AuthView = "login" | "register" | "forgot";

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>("login");

  return (
    <div className="auth-container">
      <h1 className="system-title">医院挂号系统</h1>
      {view === "login" && (
        <LoginForm
          onSwitch={() => setView("register")}
          onForgotPassword={() => setView("forgot")}
        />
      )}
      {view === "register" && (
        <RegisterForm
          onSwitch={() => setView("login")}
        />
      )}
      {view === "forgot" && (
        <ForgotPasswordForm
          onBackToLogin={() => setView("login")}
          onSwitchToRegister={() => setView("register")}
        />
      )}
    </div>
  );
};

export default AuthPage;
