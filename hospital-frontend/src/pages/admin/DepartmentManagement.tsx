import React from "react";

type DeptStatus = "开放" | "暂停" | "调整中";

interface Department {
  id: number;
  name: string;
  lead: string;
  doctors: number;
  rooms: number;
  status: DeptStatus;
  focus: string;
}

const DepartmentManagement: React.FC = () => {
  const departments: Department[] = [
    { id: 1, name: "内科", lead: "王磊", doctors: 18, rooms: 12, status: "开放", focus: "慢病复诊，糖尿病随访" },
    { id: 2, name: "儿科", lead: "林静", doctors: 12, rooms: 8, status: "开放", focus: "疫苗咨询、发热门诊" },
    { id: 3, name: "外科", lead: "陈思", doctors: 14, rooms: 10, status: "调整中", focus: "择期手术节奏优化" },
    { id: 4, name: "眼科", lead: "李言", doctors: 9, rooms: 6, status: "开放", focus: "白内障、视光复查" },
    { id: 5, name: "骨科", lead: "张驰", doctors: 11, rooms: 7, status: "暂停", focus: "影像升级中，号源收敛" },
  ];

  const statusTone = (status: DeptStatus) => {
    if (status === "开放") return "pill-success";
    if (status === "调整中") return "pill-warning";
    return "pill-danger";
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-heading">科室管理</h1>
          <p className="page-subtitle">掌握各科室人力、诊室与状态，便于挂号与排班联动。</p>
        </div>
        <div className="page-actions">
          <span className="pill pill-muted">模拟数据</span>
          <button className="primary-button" type="button">
            新增科室
          </button>
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">科室面板</h3>
          <span className="badge">与挂号、排班共享</span>
        </div>

        <div className="card-grid">
          {departments.map((dept) => (
            <div key={dept.id} className="card-item">
              <div className="table-actions">
                <strong>{dept.name}</strong>
                <span className={`pill ${statusTone(dept.status)}`}>{dept.status}</span>
              </div>
              <p className="muted">{dept.focus}</p>
              <div className="inline-list">
                <span className="badge">负责人 {dept.lead}</span>
                <span className="badge">在岗医生 {dept.doctors}</span>
                <span className="badge">诊室 {dept.rooms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card">
        <div className="table-actions">
          <h3 className="section-title">科室列表</h3>
          <span className="pill pill-outline">展示可编辑字段</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>负责人</th>
              <th>医生数</th>
              <th>诊室数</th>
              <th>状态</th>
              <th>当前重点</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.lead}</td>
                <td>{dept.doctors}</td>
                <td>{dept.rooms}</td>
                <td>
                  <span className={`pill ${statusTone(dept.status)}`}>{dept.status}</span>
                </td>
                <td>{dept.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentManagement;
