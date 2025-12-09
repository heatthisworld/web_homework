import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { LoginRequest } from '../../types';
import './login.css';

// 表单验证规则
const loginSchema = yup.object().shape({
  username: yup.string().required('用户名不能为空'),
  password: yup.string().required('密码不能为空').min(6, '密码长度不能少于6位'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 处理登录提交
  const onLogin = async (data: LoginRequest) => {
    try {
      // 这里可以添加API请求，获取真实的登录数据
      // const response = await apiClient.post<LoginResponse>('/auth/login', data);
      // localStorage.setItem('token', response.token);
      // localStorage.setItem('user', JSON.stringify(response.user));
      
      // 模拟登录成功
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: data.username, role: 'ADMIN' }));
      
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="login-container">
      <Card title="医院管理系统登录" className="login-card">
        <Form
          name="login-form"
          onFinish={handleSubmit(onLogin)}
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              {...register('username')}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              {...register('password')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;