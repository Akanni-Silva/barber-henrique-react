// src/api/endpoints/schedule.endpoint.ts

import { api } from "../axiosConfig";

export const scheduleEndpoint = {
  // ✅ Buscar slots para HOJE (com validação de horário passado)
  getTodaySlots: async (duration?: number) => {
    const response = await api.get("/schedule/today-slots", {
      params: { duration },
    });
    return response.data;
  },

  // ✅ Buscar slots para uma data específica (SEM validação)
  getAvailableSlots: async (date: string, duration?: number) => {
    const response = await api.get("/schedule/available-slots", {
      params: { date, duration },
    });
    return response.data;
  },

  // Ver horário de funcionamento (público)
  getWorkingHours: async (date: string) => {
    const response = await api.get("/schedule/working-hours", {
      params: { date },
    });
    return response.data;
  },

  // ✅ Horário de funcionamento para HOJE
  getTodayWorkingHours: async () => {
    const response = await api.get("/schedule/today-working-hours");
    return response.data;
  },

  // Configurar horário de trabalho (protegido)
  upsertWorkSchedule: async (data: {
    day_of_week: number;
    is_working: boolean;
    start_time?: string;
    end_time?: string;
    slot_duration?: number;
  }) => {
    const response = await api.post("/schedule/work-schedule", data);
    return response.data;
  },

  // Listar horários configurados (protegido)
  findAllWorkSchedules: async () => {
    const response = await api.get("/schedule/work-schedule");
    return response.data;
  },

  // Bloquear data (protegido)
  blockDate: async (data: {
    blocked_date: string;
    reason?: string;
    is_full_day?: boolean;
  }) => {
    const response = await api.post("/schedule/blocked-dates", data);
    return response.data;
  },

  // Listar datas bloqueadas (protegido)
  findAllBlockedDates: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get("/schedule/blocked-dates", { params });
    return response.data;
  },

  // Desbloquear data (protegido)
  unblockDate: async (id: number) => {
    const response = await api.delete(`/schedule/blocked-dates/${id}`);
    return response.data;
  },
};
