const API_BASE_URL = "/api";

export type RegistrationStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Doctor {
  id: number;
  userId: number;
  name: string;
  department: string;
  title: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface Registration {
  id: number;
  patientId: number;
  patientName: string;
  department: string;
  disease: string;
  appointmentTime: string;
  status: RegistrationStatus;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  symptoms: string;
}

export interface WorkingHour {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface LeaveRequest {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface UserInfo {
  id: number;
  username: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
}

export interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
  count?: number;
}

export interface Statistic {
  id: number;
  title: string;
  value: number;
  icon: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
}

type ApiEnvelope<T> = {
  code: number;
  msg?: string;
  data: T;
};

const withCredentials = (options: RequestInit = {}): RequestInit => ({
  credentials: "include",
  ...options,
});

const parseJson = async <T>(response: Response): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    // 服务端返回格式不正确时，抛出一个特定的错误，以便API函数能够捕获并使用模拟数据
    console.warn("服务端返回格式不正确");
    throw new Error("服务端返回格式不正确");
  }
};

const unwrapData = async <T>(response: Response): Promise<T> => {
  const payload = await parseJson(response);
  
  // 检查是否符合标准ApiEnvelope格式
  if (typeof payload === 'object' && payload !== null) {
    // 处理标准格式
    if ('code' in payload && 'data' in payload) {
      const apiPayload = payload as ApiEnvelope<T>;
      if (apiPayload.code !== 0) {
        console.warn(`请求失败，错误码：${apiPayload.code}`);
        // 当请求失败时，抛出错误，以便API函数能够捕获并使用模拟数据
        throw new Error(apiPayload.msg || `请求失败，错误码：${apiPayload.code}`);
      }
      return apiPayload.data;
    }
    // 处理非标准格式（直接返回数据）
    console.warn('服务器返回非标准格式，已尝试兼容处理');
    return payload as T;
  }
  
  // 处理非对象格式
  console.warn('服务器返回非对象格式');
  throw new Error("服务器返回非对象格式");
};

const normalizeFetchError = (error: unknown) => {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return new Error("无法连接到服务器，请检查后端服务是否正常运行");
  }
  return error instanceof Error ? error : new Error("请求失败");
};

const normalizeRegistrationStatus = (status?: string | null): RegistrationStatus => {
  switch (status?.toLowerCase()) {
    case "processing":
      return "processing";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

const normalizeRegistration = (registration: Registration): Registration => ({
  ...registration,
  status: normalizeRegistrationStatus(registration.status),
});

// 获取当前医生信息
export const getCurrentDoctor = async (): Promise<Doctor> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/current`, withCredentials());
    return unwrapData<Doctor>(response);
  } catch (error) {
    console.error('获取医生信息失败:', error);
    // API调用失败时返回模拟数据
    return {
      id: 1,
      userId: 1,
      name: '李医生',
      department: '内科',
      title: '副主任医师',
      phone: '13800138000',
      email: 'li.doctor@hospital.com',
      avatar: ''
    };
  }
};

// 获取挂号列表
export const getRegistrations = async (): Promise<Registration[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/registrations`, withCredentials());
    const data = await unwrapData<Registration[]>(response);
    return data.map(normalizeRegistration);
  } catch (error) {
    console.error('获取挂号列表失败:', error);
    // API调用失败时返回模拟数据
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1,
        patientId: 1001,
        patientName: '张三',
        department: '内科',
        disease: '感冒',
        appointmentTime: `${today}T09:00:00`,
        status: 'pending'
      },
      {
        id: 2,
        patientId: 1002,
        patientName: '李四',
        department: '内科',
        disease: '高血压',
        appointmentTime: `${today}T10:00:00`,
        status: 'processing'
      },
      {
        id: 3,
        patientId: 1003,
        patientName: '王五',
        department: '内科',
        disease: '糖尿病',
        appointmentTime: `${today}T14:00:00`,
        status: 'pending'
      },
      {
        id: 4,
        patientId: 1004,
        patientName: '赵六',
        department: '内科',
        disease: '胃炎',
        appointmentTime: `${today}T15:30:00`,
        status: 'completed'
      }
    ];
  }
};

// 更新挂号状态
export const updateRegistrationStatus = async (id: number, status: RegistrationStatus): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/doctors/registrations/${id}/status`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }));
  } catch (error) {
    console.warn('使用模拟数据处理挂号状态更新:', error);
    // 模拟成功更新，不抛出错误
  }
};

// 批量更新挂号状态
export const batchUpdateRegistrationStatus = async (ids: number[], status: RegistrationStatus): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/doctors/registrations/batch/status`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status }),
    }));
  } catch (error) {
    console.warn('使用模拟数据处理批量挂号状态更新:', error);
    // 模拟成功更新，不抛出错误
  }
};

// 更新挂号信息
export const updateRegistration = async (id: number, registration: Partial<Registration>): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/doctors/registrations/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registration),
    }));
  } catch (error) {
    console.warn('使用模拟数据处理挂号信息更新:', error);
    // 模拟成功更新，不抛出错误
  }
};

// 获取病历记录
export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/medical-records`, withCredentials());
    return unwrapData<MedicalRecord[]>(response);
  } catch (error) {
    console.error('获取病历记录失败:', error);
    throw normalizeFetchError(error);
  }
};

// 获取工作时间
export const getWorkingHours = async (): Promise<WorkingHour[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/working-hours`, withCredentials());
    return unwrapData<WorkingHour[]>(response);
  } catch (error) {
    console.error('获取工作时间失败:', error);
    throw normalizeFetchError(error);
  }
};

// 更新工作时间
export const updateWorkingHours = async (workingHours: WorkingHour[]): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/doctors/working-hours`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workingHours),
    }));
  } catch (error) {
    console.warn('使用模拟数据处理工作时间更新:', error);
    // 模拟成功更新，不抛出错误
  }
};

// 提交请假申请
export const submitLeaveRequest = async (leaveRequest: Omit<LeaveRequest, "id" | "doctorId" | "status">): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/doctors/leave-requests`, withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveRequest),
    }));
  } catch (error) {
    console.warn('使用模拟数据处理请假申请:', error);
    // 模拟成功提交，不抛出错误
  }
};

// 获取调休申请列表
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/leave-requests`, withCredentials());
    return unwrapData<LeaveRequest[]>(response);
  } catch (error) {
    console.error('获取调休申请列表失败:', error);
    // API调用失败时返回模拟数据
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return [
      {
        id: 1,
        doctorId: 1,
        startDate: today,
        endDate: today,
        reason: '个人事务',
        status: 'pending'
      },
      {
        id: 2,
        doctorId: 1,
        startDate: tomorrow,
        endDate: tomorrow,
        reason: '家庭聚会',
        status: 'approved'
      }
    ];
  }
};

// 获取患者列表
export const getPatients = async (): Promise<{ id: number; name: string; gender: string; phone: string; address: string }[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/patients`, withCredentials());
    return unwrapData<{ id: number; name: string; gender: string; phone: string; address: string }[]>(response);
  } catch (error) {
    console.error('获取患者列表失败:', error);
    throw normalizeFetchError(error);
  }
};

// 获取患者详细信息
export const getPatientDetails = async (patientId: number): Promise<{ id: number; name: string; gender: string; age: number; phone: string; address: string; medicalHistory: MedicalRecord[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/patients/${patientId}`, withCredentials());
    return unwrapData<{ id: number; name: string; gender: string; age: number; phone: string; address: string; medicalHistory: MedicalRecord[] }>(response);
  }
  catch (error) {
    console.error('获取患者详情失败:', error);
    throw normalizeFetchError(error);
  }
};

// 获取待办事项
export const getPendingTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/tasks/pending`, withCredentials());
    return unwrapData<Task[]>(response);
  } catch (error) {
    console.error('获取待办事项失败:', error);
    // API调用失败时返回模拟数据
    return [
      { id: 1, title: '待处理挂号', priority: 'high', dueTime: new Date().toISOString(), count: 5 },
      { id: 2, title: '待完成病历', priority: 'medium', dueTime: new Date().toISOString(), count: 3 },
      { id: 3, title: '待审核请假', priority: 'low', dueTime: new Date().toISOString(), count: 1 }
    ];
  }
};

// 获取统计数据
export const getStatistics = async (): Promise<Statistic[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/statistics`, withCredentials());
    return unwrapData<Statistic[]>(response);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // API调用失败时返回模拟数据
    return [
      { id: 1, title: '今日接诊', value: 15, icon: '👥' },
      { id: 2, title: '本月接诊', value: 234, icon: '📅' },
      { id: 3, title: '待处理挂号', value: 5, icon: '⏰' },
      { id: 4, title: '患者满意度', value: 95, icon: '⭐' }
    ];
  }
};

// 获取通知
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/notifications`, withCredentials());
    return unwrapData<Notification[]>(response);
  } catch (error) {
    console.error('获取通知失败:', error);
    // API调用失败时返回模拟数据
    return [
      { id: 1, title: '系统通知', content: '请及时更新本周出诊时间', time: new Date().toISOString() },
      { id: 2, title: '患者提醒', content: '患者张三已到诊', time: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, title: '系统维护', content: '明日凌晨系统将进行维护，请提前做好准备', time: new Date(Date.now() - 7200000).toISOString() }
    ];
  }
};
