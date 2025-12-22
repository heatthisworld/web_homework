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
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDoctor {
  id: number;
  name: string;
  department?: string;
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
  appointmentTime?: string;
  status: string;
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
