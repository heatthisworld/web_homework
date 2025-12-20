import React from "react";
import "../../mobile.css";

interface LeftSidebarProps {
  visible: boolean;
  onClose: () => void;
  debugMode?: boolean;
  onToggleDebugMode?: (value: boolean) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  visible,
  onClose,
  debugMode = false,
  onToggleDebugMode,
}) => {
  return (
    <>
      {/* 半透明遮罩 */}
      {visible && <div className="sidebar-mask" onClick={onClose} />}

      {/* 左侧侧边栏 */}
      <div className={`sidebar-container ${visible ? "show" : ""}`}>
        <div className="sidebar-header">导航菜单</div>

        <div className="sidebar-item">🏠 首页</div>
        <div className="sidebar-item">📄 我的订单</div>
        <div className="sidebar-item">🔔 通知中心</div>
        <div className="sidebar-item">⚙ 设置</div>
        <div className="sidebar-item">📞 联系客服</div>

        <div className="sidebar-divider" />
        <label className="sidebar-item sidebar-toggle">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => onToggleDebugMode?.(e.target.checked)}
          />
          <span className="toggle-label">开启 Debug 模式（使用模拟数据）</span>
        </label>
      </div>
    </>
  );
};

export default LeftSidebar;
