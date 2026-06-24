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
  avatar_url?: string | null;
  total_appointments: number;
  total_spent: number;
  last_visit?: string | null;
  notes?: string | null;
  is_active: boolean;
  preferences?: string | null;
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

export interface Product {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string | null;
  category?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  duration_minutes: number;
  category?: string;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  duration_minutes?: number;
  category?: string;
  is_active?: boolean;
}

// ========================================
// 📦 MODELOS DE AGENDAMENTOS
// ========================================

export interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  client?: Client; // Opcional porque pode vir populado ou não
  service?: Product; // Opcional porque pode vir populado ou não
  appointment_date: string;
  appointment_time: string;
  status: StatusType;
  notes?: string | null;
  whatsapp_message_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para criação de agendamento (público)
export interface CreateAppointmentData {
  client_name: string;
  client_phone: string;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

// Interface para atualização de agendamento
export interface UpdateAppointmentData {
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

// Interface para filtros de agendamento
export interface AppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | "appointment_date"
    | "created_at"
    | "appointment_time"
    | "client_name";
}

// ========================================
// 📦 MODELOS DE AGENDA (SCHEDULE)
// ========================================

export interface WorkSchedule {
  id: number;
  day_of_week: number; // 0 = Domingo, 6 = Sábado
  is_working: boolean;
  start_time?: string | null;
  end_time?: string | null;
  slot_duration: number;
  lunch_start?: string | null;
  lunch_end?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: number;
  blocked_date: string;
  reason?: string | null;
  is_full_day: boolean;
  start_time?: string | null;
  end_time?: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialHours {
  id: number;
  special_date: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// 📦 MODELOS DE AGENDA - RESPOSTAS DA API
// ========================================

export interface AvailableSlotsResponse {
  slots: string[];
  date: string;
  is_working: boolean;
}

export interface TodayWorkingHoursResponse {
  is_working: boolean;
  start_time?: string;
  end_time?: string;
  slot_duration?: number;
  message?: string;
}

export interface WorkingHoursResponse {
  date: string;
  is_working: boolean;
  start_time?: string;
  end_time?: string;
  slot_duration?: number;
}

// ========================================
// 📦 MODELOS DE RESPOSTA DA API
// ========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit?: number;
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
  most_frequent_client?: Client;
  top_spender?: Client;
}

// ========================================
// 📦 UTILITÁRIOS
// ========================================

export type StatusType = "pending" | "confirmed" | "completed" | "cancelled";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Helper para verificar se um status é válido
export const isValidStatus = (status: string): status is StatusType => {
  return ["pending", "confirmed", "completed", "cancelled"].includes(status);
};

// Helper para obter label do status
export const getStatusLabel = (status: StatusType): string => {
  const labels: Record<StatusType, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
};

// Helper para obter cor do status
export const getStatusColor = (status: StatusType): string => {
  const colors: Record<StatusType, string> = {
    pending: "text-yellow-500",
    confirmed: "text-green-500",
    completed: "text-blue-500",
    cancelled: "text-red-500",
  };
  return colors[status] || "text-gray-500";
};
