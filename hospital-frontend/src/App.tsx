import { Layout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, TeamOutlined, CalendarOutlined, LogoutOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Content, Sider } = Layout;

// 菜单项配置
const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/patients', icon: <UserOutlined />, label: '患者管理' },
  { key: '/doctors', icon: <TeamOutlined />, label: '医生管理' },
  { key: '/appointments', icon: <CalendarOutlined />, label: '预约管理' },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    token: { colorBgContainer, borderRadiusLG }, 
  } = theme.useToken();

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          医院管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout style={{ marginLeft: 200 }}>
        {/* 顶部导航 */}
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '24px' }}>
          <Menu mode="horizontal" items={[{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }]} />
        </Header>
        
        {/* 内容区域 */}
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
