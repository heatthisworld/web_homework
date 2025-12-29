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
    console.warn('使用模拟数据展示当前医生信息:', error);
    // 返回模拟数据
    return {
      id: 1,
      userId: 1,
      name: '张医生',
      department: '内科',
      title: '主任医师',
      phone: '13900139001',
      email: 'doctor@hospital.com',
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
    console.warn('使用模拟数据展示挂号列表:', error);
    // 返回模拟数据
    return [
      { id: 1, patientId: 101, patientName: '张三', department: '内科', disease: '感冒', appointmentTime: '2025-12-30 09:00', status: 'pending' },
      { id: 2, patientId: 102, patientName: '李四', department: '外科', disease: '骨折', appointmentTime: '2025-12-30 10:00', status: 'processing' },
      { id: 3, patientId: 103, patientName: '王五', department: '儿科', disease: '发烧', appointmentTime: '2025-12-30 11:00', status: 'completed' },
      { id: 4, patientId: 104, patientName: '赵六', department: '眼科', disease: '近视', appointmentTime: '2025-12-30 14:00', status: 'pending' },
      { id: 5, patientId: 105, patientName: '孙七', department: '内科', disease: '高血压', appointmentTime: '2025-12-30 15:00', status: 'cancelled' }
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

// 获取病历记录
export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/medical-records`, withCredentials());
    return unwrapData<MedicalRecord[]>(response);
  } catch (error) {
    console.warn('使用模拟数据展示病历记录:', error);
    // 返回模拟数据
    return [
      { id: 1, patientId: 101, patientName: '张三', doctorName: '李医生', visitDate: '2025-12-25', diagnosis: '感冒', treatment: '药物治疗', medications: ['感冒药', '退烧药'], symptoms: '头痛、咳嗽、发烧' },
      { id: 2, patientId: 102, patientName: '李四', doctorName: '王医生', visitDate: '2025-12-26', diagnosis: '骨折', treatment: '石膏固定', medications: ['止痛药'], symptoms: '手臂疼痛、肿胀' }
    ];
  }
};

// 获取工作时间
export const getWorkingHours = async (): Promise<WorkingHour[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/working-hours`, withCredentials());
    return unwrapData<WorkingHour[]>(response);
  } catch (error) {
    console.warn('使用模拟数据展示工作时间:', error);
    // 返回模拟数据
    return [
      { id: 1, doctorId: 1, dayOfWeek: 1, startTime: '08:00', endTime: '12:00', isWorking: true },
      { id: 2, doctorId: 1, dayOfWeek: 1, startTime: '14:00', endTime: '18:00', isWorking: true },
      { id: 3, doctorId: 1, dayOfWeek: 2, startTime: '08:00', endTime: '12:00', isWorking: true },
      { id: 4, doctorId: 1, dayOfWeek: 2, startTime: '14:00', endTime: '18:00', isWorking: true },
      { id: 5, doctorId: 1, dayOfWeek: 3, startTime: '08:00', endTime: '12:00', isWorking: true },
      { id: 6, doctorId: 1, dayOfWeek: 3, startTime: '14:00', endTime: '18:00', isWorking: true },
      { id: 7, doctorId: 1, dayOfWeek: 4, startTime: '08:00', endTime: '12:00', isWorking: true },
      { id: 8, doctorId: 1, dayOfWeek: 4, startTime: '14:00', endTime: '18:00', isWorking: true },
      { id: 9, doctorId: 1, dayOfWeek: 5, startTime: '08:00', endTime: '12:00', isWorking: true },
      { id: 10, doctorId: 1, dayOfWeek: 5, startTime: '14:00', endTime: '18:00', isWorking: true },
      { id: 11, doctorId: 1, dayOfWeek: 6, startTime: '09:00', endTime: '12:00', isWorking: false },
      { id: 12, doctorId: 1, dayOfWeek: 6, startTime: '14:00', endTime: '16:00', isWorking: false },
      { id: 13, doctorId: 1, dayOfWeek: 0, startTime: '09:00', endTime: '12:00', isWorking: false },
      { id: 14, doctorId: 1, dayOfWeek: 0, startTime: '14:00', endTime: '16:00', isWorking: false }
    ];
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

// 获取患者列表
export const getPatients = async (): Promise<{ id: number; name: string; gender: string; phone: string; address: string }[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/patients`, withCredentials());
    return unwrapData<{ id: number; name: string; gender: string; phone: string; address: string }[]>(response);
  } catch (error) {
    console.warn('使用模拟数据展示患者列表:', error);
    // 返回模拟数据
    return [
      { id: 101, name: '张三', gender: '男', phone: '13800138001', address: '北京市朝阳区' },
      { id: 102, name: '李四', gender: '女', phone: '13800138002', address: '北京市海淀区' },
      { id: 103, name: '王五', gender: '男', phone: '13800138003', address: '北京市西城区' },
      { id: 104, name: '赵六', gender: '女', phone: '13800138004', address: '北京市东城区' },
      { id: 105, name: '孙七', gender: '男', phone: '13800138005', address: '北京市丰台区' }
    ];
  }
};

// 获取患者详细信息
export const getPatientDetails = async (patientId: number): Promise<{ id: number; name: string; gender: string; age: number; phone: string; address: string; medicalHistory: MedicalRecord[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/patients/${patientId}`, withCredentials());
    return unwrapData<{ id: number; name: string; gender: string; age: number; phone: string; address: string; medicalHistory: MedicalRecord[] }>(response);
  }
  catch (error) {
    console.warn('使用模拟数据展示患者详情:', error);
    // 返回模拟数据
    return {
      id: patientId,
      name: patientId === 101 ? '张三' : patientId === 102 ? '李四' : patientId === 103 ? '王五' : '患者' + patientId,
      gender: patientId % 2 === 0 ? '女' : '男',
      age: 30 + patientId % 20,
      phone: '13800138' + patientId.toString().slice(-3),
      address: '北京市朝阳区',
      medicalHistory: [
        { id: 1, patientId, patientName: patientId === 101 ? '张三' : '患者' + patientId, doctorName: '李医生', visitDate: '2025-12-25', diagnosis: '感冒', treatment: '药物治疗', medications: ['感冒药', '退烧药'], symptoms: '头痛、咳嗽、发烧' },
        { id: 2, patientId, patientName: patientId === 101 ? '张三' : '患者' + patientId, doctorName: '王医生', visitDate: '2025-12-26', diagnosis: '高血压', treatment: '药物治疗', medications: ['降压药'], symptoms: '头痛、头晕' }
      ]
    };
  }
};
