const API_BASE_URL = "/api";

export type VisitStatus = "pending" | "completed" | "cancelled";

export interface MedicalRecordSummary {
  id: number;
  visitDate: string;
  diagnosis?: string;
  treatment?: string;
  medications: string[];
  doctor?: string;
  symptoms?: string;
}

export interface VisitRecordSummary {
  id: number;
  appointmentTime: string;
  department?: string;
  doctor?: string;
  disease?: string;
  status: VisitStatus;
  symptoms?: string;
}

export interface PatientDetails {
  id: number;
  username?: string;
  name?: string;
  gender?: "MALE" | "FEMALE";
  age?: number;
  phone?: string;
  address?: string;
  medicalHistory: MedicalRecordSummary[];
  visitHistory: VisitRecordSummary[];
}

export interface UserInfo {
  id: number;
  username: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
}

export interface PatientBasic {
  id: number;
  user: UserInfo;
  name: string;
  gender: "MALE" | "FEMALE";
  age: number;
  idCard: string;
  phone: string;
  address: string;
}

export interface DoctorSummary {
  id: number;
  name: string;
  department: string;
  title?: string;
  avatarUrl?: string;
}

// 修改：移除 diseaseId 字段
export interface CreateRegistrationRequest {
  patientId: number;
  doctorId: number;
  appointmentTime: string;
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
    throw new Error("服务端返回格式不正确");
  }
};

const unwrapData = async <T>(response: Response): Promise<T> => {
  const payload = await parseJson(response);

  if (typeof payload === 'object' && payload !== null) {
    if ('code' in payload && 'data' in payload) {
      const apiPayload = payload as ApiEnvelope<T>;
      if (apiPayload.code !== 0) {
        throw new Error(apiPayload.msg || `请求失败，错误码：${apiPayload.code}`);
      }
      return apiPayload.data;
    }
    console.warn('服务器返回非标准格式，已尝试兼容处理');
    return payload as T;
  }

  console.warn('服务器返回非对象格式，已尝试兼容处理');
  return payload as T;
};

const normalizeFetchError = (error: unknown) => {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return new Error("无法连接到服务器，请检查后端服务是否正常运行");
  }
  return error instanceof Error ? error : new Error("请求失败");
};

const normalizeVisitStatus = (status?: string | null): VisitStatus => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

const normalizePatient = (patient: PatientDetails): PatientDetails => ({
  ...patient,
  medicalHistory: patient.medicalHistory ?? [],
  visitHistory:
    patient.visitHistory?.map((visit) => ({
      ...visit,
      status: normalizeVisitStatus(visit.status),
    })) ?? [],
});

const getCurrentUser = async (): Promise<UserInfo> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, withCredentials());
  const user = await unwrapData<{ token?: string; username: string; role: UserInfo["role"] }>(response);

  const userResp = await fetch(
    `${API_BASE_URL}/users/username/${user.username}`,
    withCredentials(),
  );
  const fullUser = await unwrapData<UserInfo>(userResp);
  return fullUser;
};

const getCurrentPatientBasic = async (): Promise<PatientBasic> => {
  const user = await getCurrentUser();
  const patientResp = await fetch(
    `${API_BASE_URL}/patients/user/${user.id}`,
    withCredentials(),
  );
  return unwrapData<PatientBasic>(patientResp);
};

export const fetchPatientsWithDetails = async (): Promise<PatientDetails[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/patients/details`,
      withCredentials(),
    );
    const data = await unwrapData<PatientDetails[]>(response);
    return data.map(normalizePatient);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchPatientDetails = async (
  id: number,
): Promise<PatientDetails> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/patients/${id}/details`,
      withCredentials(),
    );
    const data = await unwrapData<PatientDetails>(response);
    return normalizePatient(data);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchCurrentPatientDetails = async (): Promise<PatientDetails> => {
  try {
    const patient = await getCurrentPatientBasic();
    return fetchPatientDetails(patient.id);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const updatePatientProfile = async (
  patientId: number,
  data: Partial<PatientBasic>,
): Promise<PatientBasic> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/patients/${patientId}`,
      withCredentials({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
    return await unwrapData<PatientBasic>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

export const fetchDoctors = async (): Promise<DoctorSummary[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`, withCredentials());
    const data = await unwrapData<DoctorSummary[]>(response);
    const normalizeAvatar = (url?: string): string => {
      if (!url || url.trim() === "") return "/files/Default.gif";
      const trimmed = url.trim();
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
        return trimmed;
      }
      if (trimmed.startsWith("/files/")) {
        return trimmed;
      }
      const cleaned = trimmed.replace(/^\/+/, "");
      return `/files/${cleaned}`;
    };

    return data.map((doc) => ({
      ...doc,
      avatarUrl: normalizeAvatar(doc.avatarUrl),
    }));
  } catch (error) {
    throw normalizeFetchError(error);
  }
};

// 修改：移除 disease 字段的发送
export const createRegistration = async (
    payload: CreateRegistrationRequest,
): Promise<void> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/registrations`,
            withCredentials({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient: { id: payload.patientId },
                    doctor: { id: payload.doctorId },
                    appointmentTime: payload.appointmentTime,
                }),
            }),
        );
        await unwrapData<unknown>(response);
    } catch (error) {
        throw normalizeFetchError(error);
    }
};

export const cancelRegistration = async (registrationId: number): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/registrations/${registrationId}`,
      withCredentials({
        method: "DELETE",
      }),
    );
    await unwrapData<unknown>(response);
  } catch (error) {
    throw normalizeFetchError(error);
  }
};