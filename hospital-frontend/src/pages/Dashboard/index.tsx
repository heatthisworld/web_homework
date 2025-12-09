import { Card, Statistic, Row, Col, Progress } from 'antd';
import { UserOutlined, TeamOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

// 模拟数据
const mockDashboardData = {
  totalPatients: 1258,
  totalDoctors: 86,
  totalAppointments: 324,
  completedAppointments: 289,
  patientGrowth: 12.5,
  doctorGrowth: 8.3,
  appointmentGrowth: 15.7,
};

const Dashboard: React.FC = () => {
  const [dashboardData] = useState(mockDashboardData);

  useEffect(() => {
    // 这里可以添加API请求，获取真实的仪表盘数据
    // apiClient.get('/dashboard').then(response => setDashboardData(response.data));
  }, []);

  return (
    <div>
      <h1>仪表盘</h1>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总患者数"
              value={dashboardData.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<Progress percent={dashboardData.patientGrowth} size="small" status="active" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总医生数"
              value={dashboardData.totalDoctors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={<Progress percent={dashboardData.doctorGrowth} size="small" status="active" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预约数"
              value={dashboardData.totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={<Progress percent={dashboardData.appointmentGrowth} size="small" status="active" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成预约"
              value={dashboardData.completedAppointments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              suffix={`${Math.round((dashboardData.completedAppointments / dashboardData.totalAppointments) * 100)}%`}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="患者增长趋势" style={{ height: 300 }}>
            {/* 这里可以添加图表组件，如 ECharts 或 Ant Design Charts */}
            <div style={{ textAlign: 'center', paddingTop: 100, color: '#999' }}>
              患者增长趋势图表（示例）
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="预约状态分布" style={{ height: 300 }}>
            {/* 这里可以添加图表组件，如 ECharts 或 Ant Design Charts */}
            <div style={{ textAlign: 'center', paddingTop: 100, color: '#999' }}>
              预约状态分布图表（示例）
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;