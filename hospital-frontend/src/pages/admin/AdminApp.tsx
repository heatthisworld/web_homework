import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import type { AdminTab } from "../../components/admin/AdminLayout";
import type { SidebarItem } from "../../components/admin/Sidebar";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import DepartmentManagement from "./DepartmentManagement";
import ScheduleManagement from "./ScheduleManagement";
import RegistrationManagement from "./RegistrationManagement";
import Statistics from "./Statistics";
import AnnouncementManagement from "./AnnouncementManagement";
import { getUserInfo, fetchCurrentUser, clearUserInfo,logout, type LoginResponse } from "../../services/authService";

type AdminPageConfig = {
  key: string;
  path: string;
  label: string;
  icon: string;
  hint?: string;
  element: React.ReactNode;
};

const pageConfigs: AdminPageConfig[] = [
  {
    key: "dashboard",
    path: "dashboard",
    label: "仪表盘",
    icon: "",
    hint: "今日概览",
    element: <Dashboard />,
  },
  {
    key: "users",
    path: "users",
    label: "用户管理",
    icon: "",
    hint: "角色 & 状态",
    element: <UserManagement />,
  },
  {
    key: "departments",
    path: "departments",
    label: "科室管理",
    icon: "",
    hint: "队伍配置",
    element: <DepartmentManagement />,
  },
  {
    key: "schedule",
    path: "schedule",
    label: "排班管理",
    icon: "",
    hint: "医生档期",
    element: <ScheduleManagement />,
  },
  {
    key: "registrations",
    path: "registrations",
    label: "挂号管理",
    icon: "",
    hint: "预约分流",
    element: <RegistrationManagement />,
  },
  {
    key: "statistics",
    path: "statistics",
    label: "统计报表",
    icon: "",
    hint: "趋势洞察",
    element: <Statistics />,
  },
  {
    key: "announcements",
    path: "announcements",
    label: "公告管理",
    icon: "",
    hint: "通知推送",
    element: <AnnouncementManagement />,
  },
];

const defaultTab: AdminTab = {
  key: "dashboard",
  label: "仪表盘",
  path: "/admin/dashboard",
  icon: "",
};

const AdminApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<AdminTab[]>([defaultTab]);

  const activeKey = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const pageKey = segments[1] || "dashboard";
    const matched = pageConfigs.find((config) => config.key === pageKey);
    return matched?.key ?? "dashboard";
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const config =
      pageConfigs.find((page) => page.key === activeKey) ?? pageConfigs[0];
    const fullPath = `/admin/${config.path}`;

    setTabs((prev) => {
      const exists = prev.some((tab) => tab.key === config.key);
      if (exists) return prev;
      return [
        ...prev,
        { key: config.key, label: config.label, path: fullPath, icon: config.icon },
      ];
    });
  }, [activeKey]);

  const ensureTab = (config: AdminPageConfig) => {
    setTabs((prev) => {
      if (prev.some((tab) => tab.key === config.key)) return prev;
      return [
        ...prev,
        {
          key: config.key,
          label: config.label,
          path: `/admin/${config.path}`,
          icon: config.icon,
        },
      ];
    });
  };

  const handleMenuSelect = (key: string) => {
    const config = pageConfigs.find((page) => page.key === key);
    if (!config) return;
    ensureTab(config);
    navigate(`/admin/${config.path}`);
  };

  const handleTabChange = (key: string) => {
    const target = tabs.find((tab) => tab.key === key);
    if (target) {
      navigate(target.path);
    }
  };

  const handleTabClose = (key: string) => {
    if (key === "dashboard") return;
    const remaining = tabs.filter((tab) => tab.key !== key);
    const fallback =
      activeKey === key
        ? remaining[remaining.length - 1] ?? defaultTab
        : null;

    setTabs(remaining.length ? remaining : [defaultTab]);

    if (fallback) {
      navigate(fallback.path);
    }
  };

  const menuItems: SidebarItem[] = pageConfigs.map(
    ({ key, label, icon, hint }) => ({
      key,
      label,
      icon,
      hint,
    })
  );

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string }>({
    name: "",
    role: "",
  });

    // 组件加载时获取用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 先从localStorage获取
        const localUser = getUserInfo();
        if (localUser) {
          // 转换角色显示名称
          const roleDisplay = {
            ADMIN: "系统管理员",
            DOCTOR: "医生",
            PATIENT: "患者",
          }[localUser.role] || localUser.role;

          setCurrentUser({
            name: localUser.username, // 可以根据需要调整为真实姓名
            role: roleDisplay,
          });
        } else {
          // 如果localStorage没有，尝试从服务器获取
          const serverUser = await fetchCurrentUser();
          const roleDisplay = {
            ADMIN: "系统管理员",
            DOCTOR: "医生",
            PATIENT: "患者",
          }[serverUser.role] || serverUser.role;

          setCurrentUser({
            name: serverUser.username,
            role: roleDisplay,
          });
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        // 如果获取失败，跳转到登录页面
        navigate("/auth/login");
      }
    };

    loadUserInfo();
  }, [navigate]);

  return (
    <AdminLayout
      activeMenu={activeKey}
      menuItems={menuItems}
      tabs={tabs}
      onMenuSelect={handleMenuSelect}
      onTabChange={handleTabChange}
      onTabClose={handleTabClose}
      currentUser={currentUser}
      onLogout={async () => {
        try {
          await logout();
        } catch (error) {
          console.error("登出失败:", error);
        } finally {
          // 确保清除用户信息并跳转登录页
          clearUserInfo();
          navigate("/");
        }
      }}
    >
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="schedule" element={<ScheduleManagement />} />
        <Route path="registrations" element={<RegistrationManagement />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="announcements" element={<AnnouncementManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
