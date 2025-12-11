import React, { useState } from 'react';

interface Department {
  id: number;
  name: string;
  description: string;
  doctorCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const DepartmentManagement: React.FC = () => {
  // 模拟数据
  const departments: Department[] = [
    { 
      id: 1, 
      name: '内科', 
      description: '负责诊断和治疗内脏疾病', 
      doctorCount: 24, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 2, 
      name: '外科', 
      description: '负责手术治疗各种疾病', 
      doctorCount: 18, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 3, 
      name: '儿科', 
      description: '负责儿童疾病的诊断和治疗', 
      doctorCount: 12, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 4, 
      name: '妇产科', 
      description: '负责妇科和产科疾病的诊断和治疗', 
      doctorCount: 10, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 5, 
      name: '眼科', 
      description: '负责眼部疾病的诊断和治疗', 
      doctorCount: 8, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 6, 
      name: '耳鼻喉科', 
      description: '负责耳鼻喉疾病的诊断和治疗', 
      doctorCount: 6, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 7, 
      name: '口腔科', 
      description: '负责口腔疾病的诊断和治疗', 
      doctorCount: 9, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
    { 
      id: 8, 
      name: '皮肤科', 
      description: '负责皮肤疾病的诊断和治疗', 
      doctorCount: 7, 
      status: 'active', 
      createdAt: '2025-01-01' 
    },
  ];

  // 状态管理
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  // 筛选科室
  const filterDepartments = () => {
    let filtered = [...departments];

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(dept => dept.status === selectedStatus);
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(term) ||
        dept.description.toLowerCase().includes(term)
      );
    }

    setFilteredDepartments(filtered);
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    filterDepartments();
  }, [searchTerm, selectedStatus]);

  // 切换科室选择状态
  const toggleSelectDepartment = (id: number) => {
    setSelectedDepartments(prev => 
      prev.includes(id)
        ? prev.filter(deptId => deptId !== id)
        : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedDepartments.length === filteredDepartments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(filteredDepartments.map(dept => dept.id));
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: Department['status']) => {
    return status === 'active' ? '活跃' : '禁用';
  };

  // 获取状态样式类名
  const getStatusClass = (status: Department['status']) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="department-management">
      <h1>科室管理</h1>
      
      {/* 筛选和搜索 */}
      <div className="filter-section">
        <div className="filter-row">
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
              placeholder="搜索科室名称或描述..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <button className="btn btn-primary" onClick={filterDepartments}>
              筛选
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
            }}>
              重置
            </button>
          </div>
        </div>
      </div>
      
      {/* 批量操作 */}
      {selectedDepartments.length > 0 && (
        <div className="batch-actions">
          <span>已选择 {selectedDepartments.length} 个科室</span>
          <div className="batch-buttons">
            <button className="btn btn-primary">批量启用</button>
            <button className="btn btn-danger">批量禁用</button>
          </div>
        </div>
      )}
      
      {/* 科室列表 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedDepartments.length === filteredDepartments.length && filteredDepartments.length > 0} 
                  onChange={toggleSelectAll} 
                />
              </th>
              <th>ID</th>
              <th>科室名称</th>
              <th>医生数量</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map(department => (
                <tr key={department.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedDepartments.includes(department.id)} 
                      onChange={() => toggleSelectDepartment(department.id)} 
                    />
                  </td>
                  <td>{department.id}</td>
                  <td>
                    <div className="department-name">{department.name}</div>
                    <div className="department-description">{department.description}</div>
                  </td>
                  <td>{department.doctorCount}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(department.status)}`}>
                      {getStatusText(department.status)}
                    </span>
                  </td>
                  <td>{department.createdAt}</td>
                  <td className="action-buttons">
                    <button className="btn btn-sm btn-primary">查看</button>
                    <button className="btn btn-sm btn-secondary">编辑</button>
                    {department.status === 'active' ? (
                      <button className="btn btn-sm btn-danger">禁用</button>
                    ) : (
                      <button className="btn btn-sm btn-success">启用</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  暂无科室数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentManagement;