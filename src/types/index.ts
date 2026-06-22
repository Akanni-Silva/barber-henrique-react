// src/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  getToken: () => string | null;
}

// src/types/index.ts

// ========================================
// 📦 MODELOS DE AUTENTICAÇÃO
// ========================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  getToken: () => string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar_url?: string;
}

// ========================================
// 📦 MODELOS DE CLIENTES
// ========================================

export interface Client {
  id: number;
  name: string;
  phone: string;
  avatar_url?: string;
  total_appointments: number;
  total_spent: number;
  last_visit?: string;
  notes?: string;
  is_active: boolean;
  preferences?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  phone?: string;
  notes?: string;
  is_active?: boolean;
}

// ========================================
// 📦 MODELOS DE PRODUTOS/SERVIÇOS
// ========================================

// src/types/index.ts (atualizado)
export interface Product {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
  category?: string; // ✅ Adicionar categoria
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  duration_minutes: number;
  category?: string; // ✅ Adicionar categoria
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  duration_minutes?: number;
  category?: string; // ✅ Adicionar categoria
  is_active?: boolean;
}

// ========================================
// 📦 MODELOS DE AGENDAMENTOS
// ========================================

export interface Appointment {
  id: number;
  client: Client;
  client_id: number;
  service: Product;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  whatsapp_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  client_name: string;
  client_phone: string;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

export interface AppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ========================================
// 📦 MODELOS DE AGENDA
// ========================================

export interface WorkSchedule {
  id: number;
  day_of_week: number; // 0 = Domingo, 6 = Sábado
  is_working: boolean;
  start_time?: string;
  end_time?: string;
  slot_duration: number;
  lunch_start?: string;
  lunch_end?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: number;
  blocked_date: string;
  reason?: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialHours {
  id: number;
  special_date: string;
  description?: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

// ========================================
// 📦 MODELOS DE RESPOSTA DA API
// ========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

// ========================================
// 📦 MODELOS DE ESTATÍSTICAS
// ========================================

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
}

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  total_revenue: number;
  average_appointments_per_client: number;
}

// ========================================
// 📦 UTILITÁRIOS
// ========================================

export type StatusType = "pending" | "confirmed" | "completed" | "cancelled";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
