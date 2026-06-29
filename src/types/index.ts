// src/types/index.ts

import {
  DotsThreeIcon,
  GitlabLogoSimpleIcon,
  HairDryerIcon,
  HandIcon,
  PackageIcon,
  PaintBrushHouseholdIcon,
  PaletteIcon,
  ScissorsIcon,
} from "@phosphor-icons/react";


export interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className: string;
  size: string;
  isConfirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  onConfirm?: () => void;
}
// ========================================
// 📦 MODELOS DE AUTENTICAÇÃO
// ========================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  // ✅ Campos de endereço (apenas para o barbeiro logado)
  address?: string | null;
  address_number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  working_hours?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  google_maps_url?: string | null;
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

/**
 * ✅ Dados para atualização do perfil
 * Inclui todos os campos editáveis do barbeiro
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  // ✅ Campos de endereço
  address?: string;
  address_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  working_hours?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  google_maps_url?: string;
}

// ✅ Alterar senha
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

/**
 * ✅ Informações públicas da barbearia
 * 🔒 Contém APENAS dados que podem ser expostos publicamente
 * ⚠️ NUNCA contém: id, email, password_hash, last_login_at
 */
export interface BarberPublicInfo {
  name: string;
  phone: string;
  avatar_url?: string | null;
  // ✅ Campos de endereço (públicos)
  address?: string | null;
  address_number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  working_hours?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  google_maps_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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

export type ProductCategory =
  | "corte"
  | "barba"
  | "coloracao"
  | "tratamento"
  | "estilizacao"
  | "pacote"
  | "outros";

export interface Product {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string | null;
  category: ProductCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
  category?: ProductCategory;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  duration_minutes?: number;
  description?: string;
  category?: ProductCategory;
  is_active?: boolean;
}

// ========================================
// 📦 MAPEAMENTO DE CATEGORIAS PARA EXIBIÇÃO
// ========================================

export const categoryLabels: Record<ProductCategory, string> = {
  corte: "Corte",
  barba: "Barba",
  coloracao: "Coloração",
  tratamento: "Tratamento",
  estilizacao: "Estilização",
  pacote: "Pacote",
  outros: "Outros",
};

// ✅ Mapeamento de categoria para ícone (apenas frontend)
export const categoryIconMap: Record<ProductCategory, string> = {
  corte: "✂️",
  barba: "🪒",
  coloracao: "🎨",
  tratamento: "💆",
  estilizacao: "🖌️",
  pacote: "📦",
  outros: "📌",
};

// ✅ Mapeamento para ícones do Phosphor
export const categoryPhosphorIcon: Record<ProductCategory, string> = {
  corte: "ScissorsIcon",
  barba: "GitlabLogoSimpleIcon",
  coloracao: "PaintBrushHouseholdIcon",
  tratamento: "HandIcon",
  estilizacao: "HairDryerIcon",
  pacote: "PackageIcon",
  outros: "DotsThreeIcon",
};

export const phosphorIcons = {
  PaintBrushHouseholdIcon,
  ScissorsIcon,
  GitlabLogoSimpleIcon,
  PaletteIcon,
  HandIcon,
  HairDryerIcon,
  PackageIcon,
  DotsThreeIcon,
} as const;

export type PhosphorIconName = keyof typeof phosphorIcons;

// ========================================
// 📦 MODELOS DE AGENDAMENTOS
// ========================================

export interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  client?: Client;
  service?: Product;
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
  day_of_week: number;
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

export interface BarberStats {
  totalAppointments: number;
  totalClients: number;
  totalRevenue: number;
  todayAppointments: number;
  monthlyRevenue?: number;
  weeklyAppointments?: number;
  averageRating?: number;
}

export interface TemporalStatus {
  label: string;
  className: string;
  icon?: string;
  priority: number;
  isPast: boolean;
  isLate: boolean;
  isUpcoming: boolean;
  minutesDiff: number;
}

// ========================================
// 📦 MODELOS DO MODAL DE REAGENDAMENTO
// ========================================

export interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
  appointment: Appointment | null;
  services?: Product[];
  isLoading?: boolean;
}

// ========================================
// 📦 MODELOS DE HISTÓRICO DO CLIENTE
// ========================================

/**
 * Estatísticas do histórico de agendamentos de um cliente
 */
export interface ClientHistoryStats {
  /** Total de agendamentos realizados */
  totalAppointments: number;
  /** Valor total gasto em todos os agendamentos */
  totalSpent: number;
  /** Ticket médio por agendamento */
  averageTicket: number;
  /** Nome do serviço mais utilizado pelo cliente */
  mostUsedService: string;
  /** Data do último agendamento (formato ISO) */
  lastVisit: string | null;
  /** Data do primeiro agendamento (formato ISO) */
  firstVisit: string | null;
}

/**
 * Agrupamento de agendamentos por mês/ano
 * @example { "2026-06": Appointment[], "2026-05": Appointment[] }
 */
export interface MonthlyAppointmentsGroup {
  [monthKey: string]: Appointment[];
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
