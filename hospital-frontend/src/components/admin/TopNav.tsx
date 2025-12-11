import React from 'react';

const TopNav: React.FC = () => {
  return (
    <div className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-title">医院管理系统 - 管理员</div>
      </div>
      
      <div className="top-nav-right">
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div className="user-name">管理员</div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;