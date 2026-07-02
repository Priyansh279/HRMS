import type { LeaveRequest, Attendance, Employee,Notice,ExitApplication,SalaryStructure} from "../types";

const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("hrms_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token)
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || res.statusText || "Request failed");
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (body: Record<string, unknown>) =>
    api<{ token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () =>
    api<{
      userId: string;
      email: string;
      role: string;
      employeeId?: string;
      employee?: unknown;
    }>("/auth/me"),
};

export const employeesApi = {
  list: () => api<Employee[]>("/employees"),
  me: () => api<Employee>("/employees/me"),
  get: (id: string) => api<Employee>(`/employees/${id}`),
  update: (id: string, body: Record<string, unknown>) =>
    api<Employee>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  create: (body: Record<string, unknown>) =>
    api<Employee>("/employees", { method: "POST", body: JSON.stringify(body) }),
};

export const leaveApi = {
  list: () => api<LeaveRequest[]>("/leave"),
  create: (body: Record<string, unknown>) =>
    api<LeaveRequest>("/leave", { method: "POST", body: JSON.stringify(body) }),
  approve: (id: string) =>
    api<LeaveRequest>(`/leave/${id}/approve`, { method: "PATCH" }),
  reject: (id: string) =>
    api<LeaveRequest>(`/leave/${id}/reject`, { method: "PATCH" }),
};

export const attendanceApi = {
  list: (params?: { employeeId?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api<Attendance[]>(`/attendance${q ? `?${q}` : ""}`);
  },
  checkIn: () => api<Attendance>("/attendance/check-in", { method: "POST" }),
  checkOut: () => api<Attendance>("/attendance/check-out", { method: "POST" }),
  update: (id: string, body: Record<string, unknown>) =>
    api<Attendance>(`/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};



export const exitApi = {
  list: async () => {
    const res = await fetch("/api/exits", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch exits");

    return result;
  },

  create: async (data: { reason: string; lastWorkingDay: string }) => {
    const res = await fetch("/api/exits/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // ✅ FIXED
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Failed to submit exit request");
    }

    return result;
  },

  approve: async (id: string) => {
    const res = await fetch(`/api/exits/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // ✅ FIXED
      },
      body: JSON.stringify({ status: "approved" }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to approve exit");

    return result;
  },

  reject: async (id: string) => {
    const res = await fetch(`/api/exits/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // ✅ FIXED
      },
      body: JSON.stringify({ status: "rejected" }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to reject exit");

    return result;
  },
};

export const noticesApi = {
  list: () => api<Notice[]>("/notices"),

  create: (body: Record<string, unknown>) =>
    api<Notice>("/notices", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Record<string, unknown>) =>
    api<Notice>(`/notices/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    api<{ message: string }>(`/notices/${id}`, {
      method: "DELETE",
    }),
};

export const salaryApi = {
 
  list: () => api<any[]>("/salary"),

  
  getMySalary: () => api<any[]>("/salary"),

  
  get: (id: string) => api<any>(`/salary/${id}`),

  // ✅ Generate salary (admin)
  generate: (body: {
    employeeId: string;
    month: string;
    year: number;
  }) =>
    api<any>("/salary/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ✅ Mark salary as paid (admin)
  markPaid: (id: string) =>
    api<any>(`/salary/${id}/pay`, {
      method: "PATCH",
    }),
};
export const salaryStructureApi = {
  list: (): Promise<SalaryStructure[]> => api("/salarystructure"),
  create: (body: any) =>
    api("/salarystructure", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};