import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ci_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ci_token");
      localStorage.removeItem("ci_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/signup", data).then((r) => r.data),
  requestReset: (email: string) =>
    api.post("/auth/request-reset", { email }).then((r) => r.data),
  verifyOtp: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/verify-otp", data).then((r) => r.data),
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardApi = {
  kpis:     () => api.get("/dashboard/kpis").then((r) => r.data.data),
  activity: () => api.get("/dashboard/activity").then((r) => r.data.data),
  alerts:   () => api.get("/dashboard/alerts").then((r) => r.data.data),
};

// ── Products ───────────────────────────────────────────────────────────────
export const productsApi = {
  list:           (params?: Record<string, unknown>) => api.get("/products", { params }).then((r) => r.data),
  get:            (id: string) => api.get(`/products/${id}`).then((r) => r.data.data),
  create:         (data: unknown) => api.post("/products", data).then((r) => r.data),
  update:         (id: string, data: unknown) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete:         (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
  categories:     () => api.get("/products/meta/categories").then((r) => r.data.data),
  createCategory: (name: string) => api.post("/products/meta/categories", { name }).then((r) => r.data),
};

// ── Warehouses ─────────────────────────────────────────────────────────────
export const warehousesApi = {
  list:           () => api.get("/warehouses").then((r) => r.data.data),
  locations:      (warehouseId?: string) =>
    api.get("/warehouses/meta/locations", { params: warehouseId ? { warehouseId } : {} }).then((r) => r.data.data),
  createLocation: (data: { name: string; warehouseId: string }) =>
    api.post("/warehouses/meta/locations", data).then((r) => r.data),
};

// ── Receipts ───────────────────────────────────────────────────────────────
export const receiptsApi = {
  list:         (params?: Record<string, unknown>) => api.get("/receipts", { params }).then((r) => r.data),
  get:          (id: string) => api.get(`/receipts/${id}`).then((r) => r.data.data),
  create:       (data: unknown) => api.post("/receipts", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/receipts/${id}/status`, { status }).then((r) => r.data),
  validate:     (id: string) => api.post(`/receipts/${id}/validate`).then((r) => r.data),
};

// ── Deliveries ─────────────────────────────────────────────────────────────
export const deliveriesApi = {
  list:         (params?: Record<string, unknown>) => api.get("/deliveries", { params }).then((r) => r.data),
  get:          (id: string) => api.get(`/deliveries/${id}`).then((r) => r.data.data),
  create:       (data: unknown) => api.post("/deliveries", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/deliveries/${id}/status`, { status }).then((r) => r.data),
  validate:     (id: string) => api.post(`/deliveries/${id}/validate`).then((r) => r.data),
};

// ── Transfers ──────────────────────────────────────────────────────────────
export const transfersApi = {
  list:     (params?: Record<string, unknown>) => api.get("/transfers", { params }).then((r) => r.data),
  get:      (id: string) => api.get(`/transfers/${id}`).then((r) => r.data.data),
  create:   (data: unknown) => api.post("/transfers", data).then((r) => r.data),
  complete: (id: string) => api.post(`/transfers/${id}/complete`).then((r) => r.data),
};

// ── Adjustments ────────────────────────────────────────────────────────────
export const adjustmentsApi = {
  list:   (params?: Record<string, unknown>) => api.get("/adjustments", { params }).then((r) => r.data),
  create: (data: unknown) => api.post("/adjustments", data).then((r) => r.data),
};

// ── Ledger ─────────────────────────────────────────────────────────────────
export const ledgerApi = {
  list: (params?: Record<string, unknown>) => api.get("/ledger", { params }).then((r) => r.data),
};

// ── Error helper ───────────────────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors?.length) return data.errors.map((e: { message: string }) => e.message).join(", ");
    return data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
