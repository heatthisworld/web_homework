import React from "react";
import "../../mobile.css";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="header-container">
      <div className="header-title">{title}</div>
    </div>
  );
};

export default Header;
