import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { Doctor } from '../../types';

// 模拟医生数据
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: '赵医生',
    gender: 'MALE',
    age: 45,
    phone: '13500135000',
    email: 'zhaoyisheng@example.com',
    departmentId: 1,
    title: '主任医师',
    specialty: '心内科',
    introduction: '从事心内科工作20年，擅长冠心病、高血压等疾病的诊治。',
    createdAt: '2020-01-15T08:30:00',
    updatedAt: '2023-03-20T14:20:00',
  },
  {
    id: 2,
    name: '钱医生',
    gender: 'FEMALE',
    age: 38,
    phone: '13600136000',
    email: 'qianyisheng@example.com',
    departmentId: 2,
    title: '副主任医师',
    specialty: '妇产科',
    introduction: '从事妇产科工作15年，擅长妇科炎症、妇科肿瘤等疾病的诊治。',
    createdAt: '2021-02-01T10:15:00',
    updatedAt: '2023-04-10T09:45:00',
  },
];

// 模拟科室数据
const mockDepartments = [
  { id: 1, name: '心内科' },
  { id: 2, name: '妇产科' },
  { id: 3, name: '儿科' },
  { id: 4, name: '外科' },
];

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 这里可以添加API请求，获取真实的医生数据
    // apiClient.get('/doctors').then(response => setDoctors(response.data));
  }, []);

  // 打开新增/编辑弹窗
  const showModal = (doctor?: Doctor) => {
    if (doctor) {
      setIsEditMode(true);
      setSelectedDoctor(doctor);
      form.setFieldsValue(doctor);
    } else {
      setIsEditMode(false);
      setSelectedDoctor(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      if (isEditMode && selectedDoctor) {
        // 编辑医生信息
        // const updatedDoctor = await apiClient.put(`/doctors/${selectedDoctor.id}`, values);
        // setDoctors(doctors.map(d => d.id === selectedDoctor.id ? updatedDoctor : d));
        
        // 模拟编辑成功
        const updatedDoctor = { ...selectedDoctor, ...values };
        setDoctors(doctors.map(d => d.id === selectedDoctor.id ? updatedDoctor : d));
        message.success('医生信息更新成功');
      } else {
        // 新增医生
        // const newDoctor = await apiClient.post('/doctors', values);
        // setDoctors([...doctors, newDoctor]);
        
        // 模拟新增成功
        const newDoctor: Doctor = {
          ...values,
          id: doctors.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoctors([...doctors, newDoctor]);
        message.success('医生信息添加成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(isEditMode ? '医生信息更新失败' : '医生信息添加失败');
    }
  };

  // 处理删除医生
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该医生信息吗？此操作不可撤销。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 删除医生
          // await apiClient.delete(`/doctors/${id}`);
          
          // 模拟删除成功
          setDoctors(doctors.filter(d => d.id !== id));
          message.success('医生信息删除成功');
        } catch (error) {
          message.error('医生信息删除失败');
        }
      },
    });
  };

  // 表格列配置
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'gender', key: 'gender', render: (gender: string) => gender === 'MALE' ? '男' : gender === 'FEMALE' ? '女' : '其他' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '科室', dataIndex: 'departmentId', key: 'departmentId', render: (id: number) => mockDepartments.find(d => d.id === id)?.name || '' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '专业', dataIndex: 'specialty', key: 'specialty' },
    { title: '简介', dataIndex: 'introduction', key: 'introduction', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Doctor) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 过滤医生列表
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.includes(searchText) || 
    doctor.phone.includes(searchText) || 
    doctor.specialty.includes(searchText)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>医生管理</h1>
        <Space>
          <Input
            placeholder="搜索医生姓名、电话或专业"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>添加医生</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredDoctors}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* 新增/编辑医生弹窗 */}
      <Modal
        title={isEditMode ? '编辑医生信息' : '添加医生信息'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入医生姓名' }]}
          >
            <Input placeholder="请输入医生姓名" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择医生性别' }]}
          >
            <Select placeholder="请选择医生性别">
              <Select.Option value="MALE">男</Select.Option>
              <Select.Option value="FEMALE">女</Select.Option>
              <Select.Option value="OTHER">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="age"
            label="年龄"
            rules={[{ required: true, message: '请输入医生年龄' }]}
          >
            <Input type="number" placeholder="请输入医生年龄" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入医生电话' }]}
          >
            <Input placeholder="请输入医生电话" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入医生邮箱" />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="科室"
            rules={[{ required: true, message: '请选择医生科室' }]}
          >
            <Select placeholder="请选择医生科室">
              {mockDepartments.map(department => (
                <Select.Option key={department.id} value={department.id}>{department.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="职称"
            rules={[{ required: true, message: '请输入医生职称' }]}
          >
            <Input placeholder="请输入医生职称" />
          </Form.Item>

          <Form.Item
            name="specialty"
            label="专业"
            rules={[{ required: true, message: '请输入医生专业' }]}
          >
            <Input placeholder="请输入医生专业" />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="简介"
          >
            <Input.TextArea placeholder="请输入医生简介" rows={4} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Doctors;