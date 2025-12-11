import React, { useState } from "react";
import Layout from "../components/layout/Layout";

const tabs = [
  { key: "home", label: "首页" },
  { key: "module1", label: "模块一" },
  { key: "module2", label: "模块二" },
  { key: "me", label: "我的" }
];

const Whiteboard: React.FC = () => {
  const [active, setActive] = useState("home");

  return (
    <Layout
      title="白板页面（带左侧导航）"
      tabs={tabs}
      activeTab={active}
      onTabChange={setActive}
    >
      <h2>{active} 区域</h2>
      <p>这是白板内容，你可以在这里设计病人/医生/管理员的页面内容。</p>
      <p>左上角 ☰ 按钮可以打开左侧导航栏。</p>
    </Layout>
  );
};

export default Whiteboard;
