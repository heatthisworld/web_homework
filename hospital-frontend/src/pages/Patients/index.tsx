import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { Patient } from '../../types';

// 模拟患者数据
const mockPatients: Patient[] = [
  {
    id: 1,
    name: '张三',
    gender: 'MALE',
    age: 35,
    phone: '13800138000',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
    idCard: '110101198001011234',
    medicalHistory: '高血压',
    createdAt: '2023-01-15T08:30:00',
    updatedAt: '2023-03-20T14:20:00',
  },
  {
    id: 2,
    name: '李四',
    gender: 'FEMALE',
    age: 28,
    phone: '13900139000',
    email: 'lisi@example.com',
    address: '上海市浦东新区',
    idCard: '310101199001011234',
    medicalHistory: '糖尿病',
    createdAt: '2023-02-01T10:15:00',
    updatedAt: '2023-04-10T09:45:00',
  },
  {
    id: 3,
    name: '王五',
    gender: 'MALE',
    age: 45,
    phone: '13700137000',
    email: 'wangwu@example.com',
    address: '广州市天河区',
    idCard: '440101197501011234',
    medicalHistory: '心脏病',
    createdAt: '2023-03-10T14:30:00',
    updatedAt: '2023-05-05T11:20:00',
  },
];

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 这里可以添加API请求，获取真实的患者数据
    // apiClient.get('/patients').then(response => setPatients(response.data));
  }, []);

  // 打开新增/编辑弹窗
  const showModal = (patient?: Patient) => {
    if (patient) {
      setIsEditMode(true);
      setSelectedPatient(patient);
      form.setFieldsValue(patient);
    } else {
      setIsEditMode(false);
      setSelectedPatient(null);
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
      if (isEditMode && selectedPatient) {
        // 编辑患者信息
        // const updatedPatient = await apiClient.put(`/patients/${selectedPatient.id}`, values);
        // setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
        
        // 模拟编辑成功
        const updatedPatient = { ...selectedPatient, ...values };
        setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
        message.success('患者信息更新成功');
      } else {
        // 新增患者
        // const newPatient = await apiClient.post('/patients', values);
        // setPatients([...patients, newPatient]);
        
        // 模拟新增成功
        const newPatient: Patient = {
          ...values,
          id: patients.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPatients([...patients, newPatient]);
        message.success('患者信息添加成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(isEditMode ? '患者信息更新失败' : '患者信息添加失败');
    }
  };

  // 处理删除患者
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该患者信息吗？此操作不可撤销。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 删除患者
          // await apiClient.delete(`/patients/${id}`);
          
          // 模拟删除成功
          setPatients(patients.filter(p => p.id !== id));
          message.success('患者信息删除成功');
        } catch (error) {
          message.error('患者信息删除失败');
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
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '病史', dataIndex: 'medicalHistory', key: 'medicalHistory' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Patient) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 过滤患者列表
  const filteredPatients = patients.filter(patient => 
    patient.name.includes(searchText) || 
    patient.phone.includes(searchText) || 
    patient.idCard.includes(searchText)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>患者管理</h1>
        <Space>
          <Input
            placeholder="搜索患者姓名、电话或身份证"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>添加患者</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPatients}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* 新增/编辑患者弹窗 */}
      <Modal
        title={isEditMode ? '编辑患者信息' : '添加患者信息'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入患者姓名' }]}
          >
            <Input placeholder="请输入患者姓名" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择患者性别' }]}
          >
            <Select placeholder="请选择患者性别">
              <Select.Option value="MALE">男</Select.Option>
              <Select.Option value="FEMALE">女</Select.Option>
              <Select.Option value="OTHER">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="age"
            label="年龄"
            rules={[{ required: true, message: '请输入患者年龄' }]}
          >
            <Input type="number" placeholder="请输入患者年龄" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入患者电话' }]}
          >
            <Input placeholder="请输入患者电话" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入患者邮箱" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入患者地址' }]}
          >
            <Input.TextArea placeholder="请输入患者地址" rows={2} />
          </Form.Item>

          <Form.Item
            name="idCard"
            label="身份证号"
            rules={[{ required: true, message: '请输入患者身份证号' }]}
          >
            <Input placeholder="请输入患者身份证号" />
          </Form.Item>

          <Form.Item
            name="medicalHistory"
            label="病史"
          >
            <Input.TextArea placeholder="请输入患者病史" rows={3} />
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

export default Patients;