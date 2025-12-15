const API_BASE_URL = '/api';

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  username: string;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  password: string;
  role: 'PATIENT'; // 只支持患者注册
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  idCard: string;
  phone: string;
  address: string;
}

// 注册响应接口
export interface RegisterResponse {
  id: number;
  username: string;
  role: 'PATIENT';
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  idCard: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// 登录功能
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    // 检查后端返回的code字段，0表示成功
    if (responseData.code !== 0) {
      throw new Error(responseData.msg || `登录失败，错误码：${responseData.code}`);
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('无法连接到服务器，请检查后端服务是否正常运行');
    }
    throw error;
  }
};

// 注册功能
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    // 检查后端返回的code字段，0表示成功
    if (responseData.code !== 0) {
      throw new Error(responseData.msg || `注册失败，错误码：${responseData.code}`);
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('无法连接到服务器，请检查后端服务是否正常运行');
    }
    throw error;
  }
};

// 保存用户信息到本地存储
export const saveUserInfo = (user: LoginResponse) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 从本地存储获取用户信息
export const getUserInfo = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) as LoginResponse : null;
};

// 清除本地存储的用户信息
export const clearUserInfo = () => {
  localStorage.removeItem('user');
};

// 获取当前用户是否已登录
export const isLoggedIn = () => {
  return !!getUserInfo();
};
