const API_BASE_URL = "/api";

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
    throw new Error("服务端返回格式不正确");
  }
};

const unwrapData = async <T>(response: Response): Promise<T> => {
  const payload = await parseJson<ApiEnvelope<T>>(response);
  if (payload.code !== 0) {
    throw new Error(payload.msg || `请求失败，错误码：${payload.code}`);
  }
  return payload.data;
};

const normalizeFetchError = (error: unknown) => {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return new Error("无法连接到服务器，请检查后端服务");
  }
  return error instanceof Error ? error : new Error("请求失败");
};

export type AdminRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalDiseases: number;
  departmentCount: number;
  todayRegistrations: number;
  monthRegistrations: number;
  registrationByDepartment: { department: string; count: number }[];
  recentRegistrations: RecentRegistration[];
}

export interface RecentRegistration {
  id: number;
  patientName?: string;
  doctorName?: string;
  department?: string;
  disease?: string;
  status: string;
  appointmentTime?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
  displayName?: string;
  email?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDoctor {
  id: number;
  name: string;
  department?: string | AdminDepartment;
  title?: string;
  phone?: string;
}

export interface AdminPatient {
  id: number;
  name: string;
  phone?: string;
  age?: number;
  address?: string;
}

export interface AdminRegistration {
  id: number;
  patient?: AdminPatient;
  doctor?: AdminDoctor;
  disease?: { id: number; name: string; department?: string };
  schedule?: { id: number };
  type?: "REGULAR" | "SPECIALIST" | "EXTRA";
  channel?: "ONLINE" | "OFFLINE";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
  appointmentTime?: string;
  status: "WAITING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
  notes?: string;
}

export interface AdminDepartment {
  id: number;
  code: string;
  name: string;
  leadName?: string;
  rooms?: number;
  focus?: string;
  status: "OPEN" | "PAUSED" | "ADJUSTING";
}

export interface AdminSchedule {
  id: number;
  doctor: { id: number; name: string; department?: AdminDepartment };
  department: AdminDepartment;
  workDate: string;
  startTime: string;
  endTime: string;
  type: "REGULAR" | "SPECIALIST" | "EXTRA";
  status: "OPEN" | "RUNNING" | "FULL" | "PAUSED";
  capacity: number;
  booked: number;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  content?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  audienceScope?: string;
  publishAt?: string;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, withCredentials());
    return await unwrapData<AdminStats>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchUsers = async (): Promise<AdminUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, withCredentials());
    return await unwrapData<AdminUser[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const createUser = async (userData: Omit<AdminUser, "id" | "createdAt" | "updatedAt" | "lastLoginAt">): Promise<AdminUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    }));
    return await unwrapData<AdminUser>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updateUser = async (id: number, userData: Partial<Omit<AdminUser, "id" | "createdAt" | "updatedAt" | "lastLoginAt">>): Promise<AdminUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    }));
    return await unwrapData<AdminUser>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, withCredentials({
      method: "DELETE"
    }));
    await unwrapData<void>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchDoctors = async (): Promise<AdminDoctor[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`, withCredentials());
    return await unwrapData<AdminDoctor[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchPatients = async (): Promise<AdminPatient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, withCredentials());
    return await unwrapData<AdminPatient[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchRegistrations = async (): Promise<AdminRegistration[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, withCredentials());
    return await unwrapData<AdminRegistration[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updateRegistration = async (id: number, registrationData: Partial<Omit<AdminRegistration, "id">>): Promise<AdminRegistration> => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData)
    }));
    return await unwrapData<AdminRegistration>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const deleteRegistration = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, withCredentials({
      method: "DELETE"
    }));
    await unwrapData<void>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchDepartments = async (): Promise<AdminDepartment[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, withCredentials());
    return await unwrapData<AdminDepartment[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const createDepartment = async (departmentData: Omit<AdminDepartment, "id">): Promise<AdminDepartment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(departmentData)
    }));
    return await unwrapData<AdminDepartment>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updateDepartment = async (id: number, departmentData: Partial<Omit<AdminDepartment, "id">>): Promise<AdminDepartment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(departmentData)
    }));
    return await unwrapData<AdminDepartment>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const deleteDepartment = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, withCredentials({
      method: "DELETE"
    }));
    await unwrapData<void>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchSchedules = async (): Promise<AdminSchedule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`, withCredentials());
    return await unwrapData<AdminSchedule[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const createSchedule = async (scheduleData: Omit<AdminSchedule, "id" | "booked">): Promise<AdminSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`, withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData)
    }));
    return await unwrapData<AdminSchedule>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updateSchedule = async (id: number, scheduleData: Partial<Omit<AdminSchedule, "id" | "booked">>): Promise<AdminSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData)
    }));
    return await unwrapData<AdminSchedule>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const deleteSchedule = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, withCredentials({
      method: "DELETE"
    }));
    await unwrapData<void>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchAnnouncements = async (): Promise<AdminAnnouncement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`, withCredentials());
    return await unwrapData<AdminAnnouncement[]>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const createAnnouncement = async (announcementData: Omit<AdminAnnouncement, "id">): Promise<AdminAnnouncement> => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`, withCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcementData)
    }));
    return await unwrapData<AdminAnnouncement>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updateAnnouncement = async (id: number, announcementData: Partial<Omit<AdminAnnouncement, "id">>): Promise<AdminAnnouncement> => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, withCredentials({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcementData)
    }));
    return await unwrapData<AdminAnnouncement>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, withCredentials({
      method: "DELETE"
    }));
    await unwrapData<void>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};
