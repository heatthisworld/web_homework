const API_BASE_URL = "/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  username: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: "PATIENT";
  email: string;
  name: string;
  gender: "MALE" | "FEMALE";
  age: number;
  idCard: string;
  phone: string;
  address: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  role: "PATIENT";
  email: string;
  name: string;
  gender: "MALE" | "FEMALE";
  age: number;
  idCard: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendResetCodeRequest {
  username: string;
  email: string;
}

export interface ResetPasswordRequest {
  username: string;
  email: string;
  code: string;
  newPassword: string;
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
    const text = await response.text();
    if (!text) {
      throw new Error(`服务器返回空响应（HTTP ${response.status}）`);
    }
    return JSON.parse(text) as T;
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
    return new Error("无法连接到服务器，请检查后端服务是否正常运行");
  }
  return error instanceof Error ? error : new Error("请求失败");
};

export const saveUserInfo = (user: LoginResponse) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUserInfo = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? (JSON.parse(userStr) as LoginResponse) : null;
};

export const clearUserInfo = () => {
  localStorage.removeItem("user");
};

export const clearAuthCookie = () => {
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `HOSPITAL_AUTH_TOKEN=; expires=${expires}; path=/`;
};

export const isLoggedIn = () => {
  return !!getUserInfo();
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      withCredentials({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    );

    return await unwrapData<LoginResponse>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const debugLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/debug/login`,
      withCredentials({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    );

    return await unwrapData<LoginResponse>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      withCredentials({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    );

    return await unwrapData<RegisterResponse>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const sendResetCode = async (
  data: SendResetCodeRequest,
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/password/send-code`,
      withCredentials({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    );
    await unwrapData<unknown>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/password/reset`,
      withCredentials({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    );
    await unwrapData<unknown>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchCurrentUser = async (): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/me`,
      withCredentials({
        method: "GET",
      }),
    );
    return await unwrapData<LoginResponse>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/logout`,
      withCredentials({
        method: "POST",
      }),
    );
    await unwrapData<unknown>(response);
    clearUserInfo();
  } catch (error) {
    throw normalizeFetchError(error);
  }
};
