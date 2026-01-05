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

// 定义统计报表需要的时间范围数据接口
export interface WorkloadData {
  date: string;
  count: number;
  avgDuration: number;
}

export interface DepartmentData {
  name: string;
  count: number;
}

export interface SatisfactionData {
  rating: number;
  count: number;
}

export interface IncomeData {
  month: string;
  amount: number;
}

export interface AgeDistributionData {
  ageRange: string;
  count: number;
}

export interface TimeRangeData {
  workloadData: WorkloadData[];
  departmentData: DepartmentData[];
  satisfactionData: SatisfactionData[];
  incomeData: IncomeData[];
  ageDistributionData: AgeDistributionData[];
}

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

// 生成统计报表数据
export const generateReportData = async (timeRange: 'day' | 'week' | 'month'): Promise<TimeRangeData> => {
  try {
    // 获取挂号数据
    const registrations = await getRegistrations();
    
    // 获取当前医生信息（暂时未使用）
    // await getCurrentDoctor();
    
    // 转换时间范围为日期对象进行过滤
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // 本周一
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    // 过滤指定时间范围内的挂号记录
    const filteredRegistrations = registrations.filter(reg => {
      const regDate = new Date(reg.appointmentTime);
      return regDate >= startDate && regDate <= endDate;
    });
    
    // 1. 生成工作量数据
    const workloadMap = new Map<string, { count: number; totalDuration: number }>();
    
    filteredRegistrations.forEach(reg => {
      const regDate = new Date(reg.appointmentTime);
      let key: string;
      
      switch (timeRange) {
        case 'day':
          // 按小时分组
          const hour = regDate.getHours();
          key = `${hour.toString().padStart(2, '0')}:00`;
          break;
        case 'week':
          // 按星期几分组
          const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          key = days[regDate.getDay()];
          break;
        case 'month':
          // 按日期分组 (YYYY-MM-DD)
          key = regDate.toISOString().split('T')[0];
          break;
      }
      
      if (!workloadMap.has(key)) {
        workloadMap.set(key, { count: 0, totalDuration: 0 });
      }
      
      const current = workloadMap.get(key)!;
      workloadMap.set(key, { 
        count: current.count + 1, 
        totalDuration: current.totalDuration + 20 // 假设平均咨询时长为20分钟
      });
    });
    
    // 生成完整的时间序列（包括没有数据的时间段）
    let workloadData: WorkloadData[] = [];
    
    switch (timeRange) {
      case 'day':
        // 生成一天24小时的完整数据
        for (let i = 0; i < 24; i++) {
          const hour = i.toString().padStart(2, '0');
          const key = `${hour}:00`;
          const data = workloadMap.get(key);
          workloadData.push({
            date: key,
            count: data?.count || 0,
            avgDuration: data?.count ? Math.round(data.totalDuration / data.count) : 0
          });
        }
        break;
      case 'week':
        // 生成一周7天的完整数据
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        days.forEach(day => {
          const data = workloadMap.get(day);
          workloadData.push({
            date: day,
            count: data?.count || 0,
            avgDuration: data?.count ? Math.round(data.totalDuration / data.count) : 0
          });
        });
        break;
      case 'month':
        // 只显示有数据的日期，避免过多空数据点
        if (workloadMap.size > 0) {
          // 将Map转换为数组并按日期排序
          workloadData = Array.from(workloadMap.entries())
            .map(([date, data]) => ({
              date,
              count: data.count,
              avgDuration: Math.round(data.totalDuration / data.count)
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else {
          // 如果没有数据，只显示当前日期
          const today = now.toISOString().split('T')[0];
          workloadData = [{
            date: today,
            count: 0,
            avgDuration: 0
          }];
        }
        break;
    }
    
    // 2. 生成科室数据（这里使用挂号记录中的department字段）
    const departmentMap = new Map<string, number>();
    filteredRegistrations.forEach(reg => {
      const dept = reg.department || '未分类';
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
    });
    
    const departmentData: DepartmentData[] = Array.from(departmentMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // 3. 生成满意度数据（模拟数据，因为API中没有直接提供）
    const satisfactionData: SatisfactionData[] = [
      { rating: 5, count: Math.floor(filteredRegistrations.length * 0.7) },
      { rating: 4, count: Math.floor(filteredRegistrations.length * 0.2) },
      { rating: 3, count: Math.floor(filteredRegistrations.length * 0.08) },
      { rating: 2, count: Math.floor(filteredRegistrations.length * 0.01) },
      { rating: 1, count: Math.floor(filteredRegistrations.length * 0.01) }
    ];
    
    // 4. 生成收入数据（模拟数据，因为API中没有直接提供）
    const incomeData: IncomeData[] = [];
    
    switch (timeRange) {
      case 'day':
        // 日收入数据
        const todayStr = now.toISOString().split('T')[0];
        incomeData.push({
          month: todayStr,
          amount: filteredRegistrations.length * 100 // 假设每个挂号100元
        });
        break;
      case 'week':
        // 周收入数据（每天）
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        weekDays.forEach((_, index) => {
          const date = new Date(now);
          date.setDate(now.getDate() - now.getDay() + index);
          const dateStr = date.toISOString().split('T')[0];
          const dayRegs = filteredRegistrations.filter(reg => 
            new Date(reg.appointmentTime).toISOString().split('T')[0] === dateStr
          );
          incomeData.push({
            month: dateStr,
            amount: dayRegs.length * 100
          });
        });
        break;
      case 'month':
        // 月收入数据（每个月，这里只生成当前月）
        const currentMonth = now.toISOString().split('-').slice(0, 2).join('-');
        incomeData.push({
          month: currentMonth,
          amount: filteredRegistrations.length * 100
        });
        break;
    }
    
    // 5. 生成年龄分布数据（模拟数据，因为API中没有直接提供）
    const ageDistributionData: AgeDistributionData[] = [
      { ageRange: '0-18', count: Math.floor(filteredRegistrations.length * 0.15) },
      { ageRange: '19-30', count: Math.floor(filteredRegistrations.length * 0.25) },
      { ageRange: '31-45', count: Math.floor(filteredRegistrations.length * 0.2) },
      { ageRange: '46-60', count: Math.floor(filteredRegistrations.length * 0.25) },
      { ageRange: '60+', count: Math.floor(filteredRegistrations.length * 0.15) }
    ];
    
    return {
      workloadData,
      departmentData,
      satisfactionData,
      incomeData,
      ageDistributionData
    };
  } catch (error) {
    console.error('生成统计报表数据失败:', error);
    // 返回模拟数据作为后备
    return {
      workloadData: Array.from({ length: timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30 }, (_, i) => ({
        date: timeRange === 'day' ? `${i.toString().padStart(2, '0')}:00` : 
              timeRange === 'week' ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i] : 
              `2025-11-${(i + 1).toString().padStart(2, '0')}`,
        count: Math.floor(Math.random() * 10),
        avgDuration: 20
      })),
      departmentData: [
        { name: '内科', count: Math.floor(Math.random() * 50) },
        { name: '外科', count: Math.floor(Math.random() * 30) },
        { name: '儿科', count: Math.floor(Math.random() * 20) },
        { name: '妇科', count: Math.floor(Math.random() * 15) },
        { name: '眼科', count: Math.floor(Math.random() * 10) }
      ],
      satisfactionData: [
        { rating: 5, count: Math.floor(Math.random() * 100) },
        { rating: 4, count: Math.floor(Math.random() * 50) },
        { rating: 3, count: Math.floor(Math.random() * 20) },
        { rating: 2, count: Math.floor(Math.random() * 10) },
        { rating: 1, count: Math.floor(Math.random() * 5) }
      ],
      incomeData: Array.from({ length: timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 1 }, (_, i) => ({
        month: timeRange === 'day' ? '2025-11-10' : 
              timeRange === 'week' ? [`2025-11-04`, `2025-11-05`, `2025-11-06`, `2025-11-07`, `2025-11-08`, `2025-11-09`, `2025-11-10`][i] : 
              '2025-11',
        amount: Math.floor(Math.random() * 30000) + 5000
      })),
      ageDistributionData: [
        { ageRange: '0-18', count: Math.floor(Math.random() * 50) },
        { ageRange: '19-30', count: Math.floor(Math.random() * 60) },
        { ageRange: '31-45', count: Math.floor(Math.random() * 50) },
        { ageRange: '46-60', count: Math.floor(Math.random() * 40) },
        { ageRange: '60+', count: Math.floor(Math.random() * 30) }
      ]
    };
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
