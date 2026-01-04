import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../mobile.css";
import { login, register, saveUserInfo } from "../../services/authService";

interface RegisterFormProps {
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [step, setStep] = useState(0); // 0: 账号, 1: 基本信息, 2: 联系方式
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [age, setAge] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const redirectByRole = (role: "DOCTOR" | "PATIENT" | "ADMIN") => {
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

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!username || !password || !confirm) {
        setError("请填写用户名和密码");
        return false;
      }
      if (password !== confirm) {
        setError("两次密码不一致");
        return false;
      }
      if (password.length < 6) {
        setError("密码长度不能少于6位");
        return false;
      }
    }
    if (currentStep === 1) {
      if (!name || !age) {
        setError("请填写姓名和年龄");
        return false;
      }
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        setError("请输入有效的年龄");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!idCard || !phone || !address) {
        setError("请填写身份证、电话和地址");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleRegister = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    const ageNum = parseInt(age, 10);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register({
        username,
        password,
        role: "PATIENT",
        name,
        gender,
        age: ageNum,
        idCard,
        phone,
        address,
      });
      const loginRes = await login({ username, password });
      saveUserInfo(loginRes);
      setSuccess("注册成功，已自动登录，正在跳转...");
      redirectByRole(loginRes.role);
      setPassword("");
      setConfirm("");
      setName("");
      setGender("MALE");
      setAge("");
      setIdCard("");
      setPhone("");
      setAddress("");
      setStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">注册</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      {step === 0 && (
        <>
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
        </>
      )}

      {step === 1 && (
        <>
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
            onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
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
        </>
      )}

      {step === 2 && (
        <>
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
            placeholder="请输入手机号"
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
        </>
      )}

      <div className="auth-step-actions">
        {step > 0 && (
          <button className="auth-btn secondary" onClick={handleBack} disabled={loading}>
            上一步
          </button>
        )}
        {step < 2 && (
          <button className="auth-btn" onClick={handleNext} disabled={loading}>
            继续
          </button>
        )}
        {step === 2 && (
          <button className="auth-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "提交中..." : "提交注册"}
          </button>
        )}
      </div>

      <div className="switch-text">
        已有账号，
        <span className="switch-link" onClick={onSwitch}>
          去登录
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;
