import React, { useState } from 'react';
import './Settings.css';

interface UserInfo {
  id: number;
  name: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  title: string;
  avatar: string;
}

const Settings: React.FC = () => {
  // 模拟数据
  const userInfo: UserInfo = {
    id: 1,
    name: '张医生',
    gender: '男',
    phone: '138****1234',
    email: 'zhangsan@hospital.com',
    department: '内科',
    title: '主任医师',
    avatar: 'https://via.placeholder.com/100'
  };

  // 状态管理
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'preferences'>('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(userInfo);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    systemNotifications: true
  });
  const [preferences, setPreferences] = useState({
    language: 'zh-CN',
    defaultView: 'dashboard',
    autoSave: true
  });

  // 保存个人信息
  const saveProfile = () => {
    // 这里可以添加保存逻辑
    alert('个人信息已保存');
    setEditing(false);
  };

  // 保存密码
  const savePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('新密码和确认密码不匹配');
      return;
    }
    // 这里可以添加密码修改逻辑
    alert('密码已修改');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  // 保存通知设置
  const saveNotificationSettings = () => {
    // 这里可以添加保存逻辑
    alert('通知设置已保存');
  };

  // 保存系统偏好
  const savePreferences = () => {
    // 这里可以添加保存逻辑
    alert('系统偏好已保存');
  };

  return (
    <div className="settings">
      <h1>个人设置</h1>
      
      {/* 标签页 */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          个人信息
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          密码修改
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          通知设置
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          系统偏好
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="tab-content">
        {/* 个人信息 */}
        {activeTab === 'profile' && (
          <div className="profile-settings">
            <div className="setting-section">
              <div className="section-header">
                <h3>个人信息</h3>
                <button 
                  className="edit-btn"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? '取消' : '编辑'}
                </button>
              </div>
              
              <div className="profile-info">
                <div className="avatar-section">
                  <div className="avatar-preview">
                    <img src={formData.avatar} alt="头像" />
                  </div>
                  {editing && (
                    <div className="avatar-upload">
                      <input type="file" accept="image/*" />
                      <label>更换头像</label>
                    </div>
                  )}
                </div>
                
                <div className="info-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>姓名</label>
                      {editing ? (
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      ) : (
                        <div className="form-value">{formData.name}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>性别</label>
                      {editing ? (
                        <select 
                          value={formData.gender} 
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="男">男</option>
                          <option value="女">女</option>
                        </select>
                      ) : (
                        <div className="form-value">{formData.gender}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>手机号码</label>
                      {editing ? (
                        <input 
                          type="tel" 
                          value={formData.phone} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      ) : (
                        <div className="form-value">{formData.phone}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>邮箱地址</label>
                      {editing ? (
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      ) : (
                        <div className="form-value">{formData.email}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>科室</label>
                      <div className="form-value">{formData.department}</div>
                    </div>
                    
                    <div className="form-group">
                      <label>职称</label>
                      <div className="form-value">{formData.title}</div>
                    </div>
                  </div>
                  
                  {editing && (
                    <div className="form-actions">
                      <button className="save-btn" onClick={saveProfile}>保存</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 密码修改 */}
        {activeTab === 'password' && (
          <div className="password-settings">
            <div className="setting-section">
              <h3>密码修改</h3>
              
              <div className="password-form">
                <div className="form-group">
                  <label>当前密码</label>
                  <input 
                    type="password" 
                    value={passwordData.oldPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>新密码</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>确认新密码</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                
                <div className="form-actions">
                  <button className="save-btn" onClick={savePassword}>修改密码</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 通知设置 */}
        {activeTab === 'notifications' && (
          <div className="notification-settings">
            <div className="setting-section">
              <h3>通知设置</h3>
              
              <div className="notification-options">
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">邮件通知</div>
                    <div className="option-description">接收系统发送的邮件通知</div>
                  </div>
                  <div className="option-toggle">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.emailNotifications} 
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    />
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">短信通知</div>
                    <div className="option-description">接收系统发送的短信通知</div>
                  </div>
                  <div className="option-toggle">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.smsNotifications} 
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                    />
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">预约提醒</div>
                    <div className="option-description">接收患者预约提醒</div>
                  </div>
                  <div className="option-toggle">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.appointmentReminders} 
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, appointmentReminders: e.target.checked })}
                    />
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">系统通知</div>
                    <div className="option-description">接收系统更新和重要通知</div>
                  </div>
                  <div className="option-toggle">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.systemNotifications} 
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, systemNotifications: e.target.checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="save-btn" onClick={saveNotificationSettings}>保存设置</button>
              </div>
            </div>
          </div>
        )}
        
        {/* 系统偏好 */}
        {activeTab === 'preferences' && (
          <div className="preferences-settings">
            <div className="setting-section">
              <h3>系统偏好</h3>
              
              <div className="preference-options">
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">语言</div>
                    <div className="option-description">选择系统语言</div>
                  </div>
                  <div className="option-select">
                    <select 
                      value={preferences.language} 
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    >
                      <option value="zh-CN">简体中文</option>
                      <option value="en-US">English (US)</option>
                      <option value="zh-TW">繁体中文</option>
                    </select>
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">默认视图</div>
                    <div className="option-description">登录后默认显示的页面</div>
                  </div>
                  <div className="option-select">
                    <select 
                      value={preferences.defaultView} 
                      onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
                    >
                      <option value="dashboard">仪表盘</option>
                      <option value="schedule">预约日程</option>
                      <option value="registration">挂号管理</option>
                    </select>
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="option-info">
                    <div className="option-title">自动保存</div>
                    <div className="option-description">自动保存表单数据</div>
                  </div>
                  <div className="option-toggle">
                    <input 
                      type="checkbox" 
                      checked={preferences.autoSave} 
                      onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="save-btn" onClick={savePreferences}>保存偏好</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
