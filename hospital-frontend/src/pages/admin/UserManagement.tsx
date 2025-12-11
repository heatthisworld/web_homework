import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  // 模拟数据
  const users: User[] = [
    { 
      id: 1, 
      name: '张医生', 
      role: 'doctor', 
      email: 'doctor1@example.com', 
      phone: '13800138001', 
      status: 'active', 
      createdAt: '2025-01-15' 
    },
    { 
      id: 2, 
      name: '李医生', 
      role: 'doctor', 
      email: 'doctor2@example.com', 
      phone: '13800138002', 
      status: 'active', 
      createdAt: '2025-02-20' 
    },
    { 
      id: 3, 
      name: '王患者', 
      role: 'patient', 
      email: 'patient1@example.com', 
      phone: '13900139001', 
      status: 'active', 
      createdAt: '2025-03-10' 
    },
    { 
      id: 4, 
      name: '赵患者', 
      role: 'patient', 
      email: 'patient2@example.com', 
      phone: '13900139002', 
      status: 'inactive', 
      createdAt: '2025-04-05' 
    },
    { 
      id: 5, 
      name: '管理员', 
      role: 'admin', 
      email: 'admin@example.com', 
      phone: '13700137001', 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 6, 
      name: '刘医生', 
      role: 'doctor', 
      email: 'doctor3@example.com', 
      phone: '13800138003', 
      status: 'active', 
      createdAt: '2025-05-15' 
    },
    { 
      id: 7, 
      name: '陈患者', 
      role: 'patient', 
      email: 'patient3@example.com', 
      phone: '13900139003', 
      status: 'active', 
      createdAt: '2025-06-20' 
    },
  ];

  // 状态管理
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // 筛选用户
  const filterUsers = () => {
    let filtered = [...users];

    // 按角色筛选
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterUsers();
  }, [selectedRole, selectedStatus, searchTerm]);

  // 切换用户选择状态
  const toggleSelectUser = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // 获取角色显示文本
  const getRoleText = (role: User['role']) => {
    const roleMap = {
      doctor: '医生',
      patient: '患者',
      admin: '管理员'
    };
    return roleMap[role];
  };

  // 获取状态显示文本
  const getStatusText = (status: User['status']) => {
    return status === 'active' ? '活跃' : '禁用';
  };

  // 获取状态样式类名
  const getStatusClass = (status: User['status']) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="user-management">
      <h1>用户管理</h1>
      
      {/* 筛选和搜索 */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>角色：</label>
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">全部角色</option>
              <option value="doctor">医生</option>
              <option value="patient">患者</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>状态：</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <input 
              type="text" 
              placeholder="搜索姓名、邮箱或电话..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <button className="btn btn-primary" onClick={filterUsers}>
              筛选
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSelectedRole('all');
              setSelectedStatus('all');
              setSearchTerm('');
            }}>
              重置
            </button>
          </div>
        </div>
      </div>
      
      {/* 批量操作 */}
      {selectedUsers.length > 0 && (
        <div className="batch-actions">
          <span>已选择 {selectedUsers.length} 个用户</span>
          <div className="batch-buttons">
            <button className="btn btn-primary">批量启用</button>
            <button className="btn btn-danger">批量禁用</button>
            <button className="btn btn-secondary">批量删除</button>
          </div>
        </div>
      )}
      
      {/* 用户列表 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} 
                  onChange={toggleSelectAll} 
                />
              </th>
              <th>ID</th>
              <th>姓名</th>
              <th>角色</th>
              <th>邮箱</th>
              <th>电话</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)} 
                      onChange={() => toggleSelectUser(user.id)} 
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{getRoleText(user.role)}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="action-buttons">
                    <button className="btn btn-sm btn-primary">查看</button>
                    <button className="btn btn-sm btn-secondary">编辑</button>
                    {user.status === 'active' ? (
                      <button className="btn btn-sm btn-danger">禁用</button>
                    ) : (
                      <button className="btn btn-sm btn-success">启用</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data">
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;