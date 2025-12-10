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
      title="通用白板页面"
      tabs={tabs}
      activeTab={active}
      onTabChange={setActive}
    >
      <div style={{ padding: 20 }}>
        <h3>{active} 内容区域</h3>
        <p>这里是白板内容，你可以替换为病人/医生/管理员的实际内容。</p>
      </div>
    </Layout>
  );
};

export default Whiteboard;
