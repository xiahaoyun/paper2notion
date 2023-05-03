import React from 'react';
import { useNavigate } from "react-router-dom";

const SettingsButton: React.FC = () => {
    const navigate  = useNavigate();
  const handleClick = () => {
    // 处理设置按钮的点击事件
    navigate(`/setting`);
  };

  return (
    <button className="settings-button text-sm fixed top-1 right-1 bg-white" onClick={handleClick}>
        ⚙Settings
    </button>
  );
};

export default SettingsButton;