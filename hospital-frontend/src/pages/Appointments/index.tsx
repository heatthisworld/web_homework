import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, TimePicker, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { Appointment } from '../../types';
import dayjs from 'dayjs';

// 模拟预约数据
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    departmentId: 1,
    appointmentDate: '2023-05-20',
    appointmentTime: '09:30',
    status: 'CONFIRMED',
    reason: '体检',
    notes: '无特殊要求',
    createdAt: '2023-05-15T10:30:00',
    updatedAt: '2023-05-16T14:20:00',
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 2,
    departmentId: 2,
    appointmentDate: '2023-05-21',
    appointmentTime: '14:00',
    status: 'PENDING',
    reason: '妇科检查',
    notes: '需要空腹',
    createdAt: '2023-05-16T09:15:00',
    updatedAt: '2023-05-16T09:15:00',
  },
];

// 模拟患者数据
const mockPatients = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
];

// 模拟医生数据
const mockDoctors = [
  { id: 1, name: '赵医生' },
  { id: 2, name: '钱医生' },
];

// 模拟科室数据
const mockDepartments = [
  { id: 1, name: '心内科' },
  { id: 2, name: '妇产科' },
];

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 这里可以添加API请求，获取真实的预约数据
    // apiClient.get('/appointments').then(response => setAppointments(response.data));
  }, []);

  // 打开新增/编辑弹窗
  const showModal = (appointment?: Appointment) => {
    if (appointment) {
      setIsEditMode(true);
      setSelectedAppointment(appointment);
      form.setFieldsValue({
        ...appointment,
        appointmentDate: dayjs(appointment.appointmentDate),
        appointmentTime: dayjs(`2000-01-01T${appointment.appointmentTime}`),
      });
    } else {
      setIsEditMode(false);
      setSelectedAppointment(null);
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
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime.format('HH:mm'),
      };

      if (isEditMode && selectedAppointment) {
        // 编辑预约信息
        // const updatedAppointment = await apiClient.put(`/appointments/${selectedAppointment.id}`, appointmentData);
        // setAppointments(appointments.map(a => a.id === selectedAppointment.id ? updatedAppointment : a));
        
        // 模拟编辑成功
        const updatedAppointment = { ...selectedAppointment, ...appointmentData };
        setAppointments(appointments.map(a => a.id === selectedAppointment.id ? updatedAppointment : a));
        message.success('预约信息更新成功');
      } else {
        // 新增预约
        // const newAppointment = await apiClient.post('/appointments', appointmentData);
        // setAppointments([...appointments, newAppointment]);
        
        // 模拟新增成功
        const newAppointment: Appointment = {
          ...appointmentData,
          id: appointments.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAppointments([...appointments, newAppointment]);
        message.success('预约信息添加成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(isEditMode ? '预约信息更新失败' : '预约信息添加失败');
    }
  };

  // 处理删除预约
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该预约信息吗？此操作不可撤销。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 删除预约
          // await apiClient.delete(`/appointments/${id}`);
          
          // 模拟删除成功
          setAppointments(appointments.filter(a => a.id !== id));
          message.success('预约信息删除成功');
        } catch (error) {
          message.error('预约信息删除失败');
        }
      },
    });
  };

  // 处理预约状态变更
  const handleStatusChange = async (id: number, status: Appointment['status']) => {
    try {
      // 更新预约状态
      // const updatedAppointment = await apiClient.patch(`/appointments/${id}/status`, { status });
      // setAppointments(appointments.map(a => a.id === id ? updatedAppointment : a));
      
      // 模拟更新成功
      const updatedAppointment = appointments.find(a => a.id === id);
      if (updatedAppointment) {
        const newAppointment = { ...updatedAppointment, status, updatedAt: new Date().toISOString() };
        setAppointments(appointments.map(a => a.id === id ? newAppointment : a));
        message.success('预约状态更新成功');
      }
    } catch (error) {
      message.error('预约状态更新失败');
    }
  };

  // 表格列配置
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '患者', dataIndex: 'patientId', key: 'patientId', render: (id: number) => mockPatients.find(p => p.id === id)?.name || '' },
    { title: '医生', dataIndex: 'doctorId', key: 'doctorId', render: (id: number) => mockDoctors.find(d => d.id === id)?.name || '' },
    { title: '科室', dataIndex: 'departmentId', key: 'departmentId', render: (id: number) => mockDepartments.find(d => d.id === id)?.name || '' },
    { title: '预约日期', dataIndex: 'appointmentDate', key: 'appointmentDate' },
    { title: '预约时间', dataIndex: 'appointmentTime', key: 'appointmentTime' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          PENDING: '待确认',
          CONFIRMED: '已确认',
          CANCELLED: '已取消',
          COMPLETED: '已完成',
        };
        return statusMap[status] || status;
      }
    },
    { title: '就诊原因', dataIndex: 'reason', key: 'reason' },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Appointment) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
          {record.status === 'PENDING' && (
            <Button onClick={() => handleStatusChange(record.id, 'CONFIRMED')}>确认</Button>
          )}
          {record.status !== 'CANCELLED' && (
            <Button danger onClick={() => handleStatusChange(record.id, 'CANCELLED')}>取消</Button>
          )}
          {record.status === 'CONFIRMED' && (
            <Button onClick={() => handleStatusChange(record.id, 'COMPLETED')}>完成</Button>
          )}
        </Space>
      ),
    },
  ];

  // 过滤预约列表
  const filteredAppointments = appointments.filter(appointment => 
    appointment.reason.includes(searchText) || 
    mockPatients.find(p => p.id === appointment.patientId)?.name.includes(searchText) ||
    mockDoctors.find(d => d.id === appointment.doctorId)?.name.includes(searchText)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>预约管理</h1>
        <Space>
          <Input
            placeholder="搜索患者姓名、医生姓名或就诊原因"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>添加预约</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAppointments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* 新增/编辑预约弹窗 */}
      <Modal
        title={isEditMode ? '编辑预约信息' : '添加预约信息'}
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
            name="patientId"
            label="患者"
            rules={[{ required: true, message: '请选择患者' }]}
          >
            <Select placeholder="请选择患者">
              {mockPatients.map(patient => (
                <Select.Option key={patient.id} value={patient.id}>{patient.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="doctorId"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生">
              {mockDoctors.map(doctor => (
                <Select.Option key={doctor.id} value={doctor.id}>{doctor.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="科室"
            rules={[{ required: true, message: '请选择科室' }]}
          >
            <Select placeholder="请选择科室">
              {mockDepartments.map(department => (
                <Select.Option key={department.id} value={department.id}>{department.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentDate"
            label="预约日期"
            rules={[{ required: true, message: '请选择预约日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="预约时间"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择预约状态' }]}
          >
            <Select placeholder="请选择预约状态">
              <Select.Option value="PENDING">待确认</Select.Option>
              <Select.Option value="CONFIRMED">已确认</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
              <Select.Option value="COMPLETED">已完成</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="就诊原因"
            rules={[{ required: true, message: '请输入就诊原因' }]}
          >
            <Input.TextArea placeholder="请输入就诊原因" rows={2} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注信息" rows={2} />
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

export default Appointments;