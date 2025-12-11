import React, { useState } from 'react';

interface SettingsProps {
  // 可以根据需要添加props
}

interface SystemSetting {
  key: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
}

const Settings: React.FC<SettingsProps> = () => {
  // 模拟系统设置数据
  const [settings, setSettings] = useState<SystemSetting[]>([
    {
      key: 'systemName',
      name: '系统名称',
      value: '医院管理系统',
      type: 'text',
      description: '显示在系统标题栏的名称'
    },
    {
      key: 'maxRegistrationsPerDay',
      name: '每日最大挂号数',
      value: 500,
      type: 'number',
      description: '每个医生每日可接受的最大挂号数'
    },
    {
      key: 'enableOnlineRegistration',
      name: '启用线上挂号',
      value: true,
      type: 'boolean',
      description: '是否允许患者在线挂号'
    },
    {
      key: 'registrationStartTime',
      name: '挂号开始时间',
      value: '08:00',
      type: 'text',
      description: '每日开始接受挂号的时间'
    },
    {
      key: 'registrationEndTime',
      name: '挂号结束时间',
      value: '18:00',
      type: 'text',
      description: '每日停止接受挂号的时间'
    },
    {
      key: 'defaultDepartment',
      name: '默认科室',
      value: '内科',
      type: 'select',
      options: ['内科', '外科', '儿科', '妇产科', '眼科', '耳鼻喉科', '口腔科', '皮肤科'],
      description: '新用户默认选择的科室'
    },
    {
      key: 'enableSmsNotification',
      name: '启用短信通知',
      value: true,
      type: 'boolean',
      description: '是否发送挂号成功短信通知'
    },
    {
      key: 'maxAppointmentDays',
      name: '最大预约天数',
      value: 7,
      type: 'number',
      description: '患者可提前预约的最大天数'
    },
  ]);

  // 模拟用户信息
  const [userInfo, setUserInfo] = useState({
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    role: 'admin'
  });

  // 状态管理
  const [activeTab, setActiveTab] = useState('system');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 更新设置
  const updateSetting = (key: string, value: string | number | boolean) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    );
  };

  // 保存设置
  const saveSettings = () => {
    // 模拟保存操作
    console.log('保存设置:', settings);
    setSaveSuccess(true);
    
    // 3秒后隐藏成功提示
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // 更新用户信息
  const updateUserInfo = (field: string, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  // 保存用户信息
  const saveUserInfo = () => {
    // 模拟保存操作
    console.log('保存用户信息:', userInfo);
    setSaveSuccess(true);
    
    // 3秒后隐藏成功提示
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="settings">
      <h1>系统设置</h1>
      
      {/* 保存成功提示 */}
      {saveSuccess && (
        <div className="save-success">
          设置已成功保存！
        </div>
      )}
      
      {/* 标签页 */}
      <div className="settings-tabs">
        <div 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          系统设置
        </div>
        <div 
          className={`tab ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          个人信息
        </div>
        <div 
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          安全设置
        </div>
      </div>
      
      {/* 标签页内容 */}
      <div className="settings-content">
        {/* 系统设置 */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <h2>系统配置</h2>
            <div className="settings-form">
              {settings.map(setting => (
                <div key={setting.key} className="form-group">
                  <label className="form-label">
                    {setting.name}
                    <span className="form-description">{setting.description}</span>
                  </label>
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      className="form-input"
                      value={setting.value as string}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                    />
                  )}
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      className="form-input"
                      value={setting.value as number}
                      onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
                    />
                  )}
                  {setting.type === 'boolean' && (
                    <input
                      type="checkbox"
                      checked={setting.value as boolean}
                      onChange={(e) => updateSetting(setting.key, e.target.checked)}
                    />
                  )}
                  {setting.type === 'select' && setting.options && (
                    <select
                      className="form-input"
                      value={setting.value as string}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                    >
                      {setting.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={saveSettings}>
                保存设置
              </button>
            </div>
          </div>
        )}
        
        {/* 个人信息 */}
        {activeTab === 'user' && (
          <div className="settings-section">
            <h2>个人信息</h2>
            <div className="settings-form">
              <div className="form-group">
                <label className="form-label">用户名</label>
                <input
                  type="text"
                  className="form-input"
                  value={userInfo.name}
                  onChange={(e) => updateUserInfo('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">邮箱</label>
                <input
                  type="email"
                  className="form-input"
                  value={userInfo.email}
                  onChange={(e) => updateUserInfo('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">电话</label>
                <input
                  type="tel"
                  className="form-input"
                  value={userInfo.phone}
                  onChange={(e) => updateUserInfo('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">角色</label>
                <input
                  type="text"
                  className="form-input"
                  value={userInfo.role}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">头像</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    <div className="avatar-placeholder">
                      {userInfo.avatar ? (
                        <img src={userInfo.avatar} alt="头像" />
                      ) : (
                        <span>上传头像</span>
                      )}
                    </div>
                  </div>
                  <input type="file" className="avatar-input" />
                </div>
              </div>
            </div>
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={saveUserInfo}>
                保存个人信息
              </button>
            </div>
          </div>
        )}
        
        {/* 安全设置 */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h2>安全设置</h2>
            <div className="settings-form">
              <div className="form-group">
                <label className="form-label">修改密码</label>
                <div className="password-fields">
                  <div className="password-field">
                    <input type="password" className="form-input" placeholder="当前密码" />
                  </div>
                  <div className="password-field">
                    <input type="password" className="form-input" placeholder="新密码" />
                  </div>
                  <div className="password-field">
                    <input type="password" className="form-input" placeholder="确认新密码" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">登录超时时间</label>
                <select className="form-input">
                  <option value="30">30分钟</option>
                  <option value="60">1小时</option>
                  <option value="120">2小时</option>
                  <option value="240">4小时</option>
                  <option value="480">8小时</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">启用双因素认证</label>
                <input type="checkbox" />
              </div>
              <div className="form-group">
                <label className="form-label">登录IP限制</label>
                <input type="checkbox" />
              </div>
            </div>
            <div className="settings-actions">
              <button className="btn btn-primary">保存安全设置</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;