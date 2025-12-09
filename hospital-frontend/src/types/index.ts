// 用户类型
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  createdAt: string;
  updatedAt: string;
}

// 患者类型
export interface Patient {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  phone: string;
  email: string;
  address: string;
  idCard: string;
  medicalHistory: string;
  createdAt: string;
  updatedAt: string;
}

// 医生类型
export interface Doctor {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  phone: string;
  email: string;
  departmentId: number;
  title: string;
  specialty: string;
  introduction: string;
  createdAt: string;
  updatedAt: string;
}

// 科室类型
export interface Department {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 预约类型
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应类型
export interface PaginationResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  user: User;
}