// src/api/endpoints/appointments.endpoint.ts

import { api } from "../axiosConfig";

export const appointmentsEndpoint = {
  // Criar agendamento (público)
  create: async (data: {
    client_name: string;
    client_phone: string;
    service_id: number;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  // Listar agendamentos (protegido)
  findAll: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/appointments", { params });
    return response.data;
  },

  // Buscar por ID (público)
  findById: async (id: number) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Agendamentos do dia (protegido)
  findToday: async () => {
    const response = await api.get("/appointments/today");
    return response.data;
  },

  // Próximos agendamentos (protegido)
  findUpcoming: async (limit: number = 10) => {
    const response = await api.get("/appointments/upcoming", {
      params: { limit },
    });
    return response.data;
  },

  // Confirmar agendamento (protegido)
  confirm: async (id: number) => {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Completar agendamento (protegido)
  complete: async (id: number) => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },

  // Cancelar agendamento (protegido)
  cancel: async (id: number, reason?: string) => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Reagendar (protegido)
  reschedule: async (
    id: number,
    data: { appointment_date: string; appointment_time: string },
  ) => {
    const response = await api.put(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  // Estatísticas (protegido)
  getStats: async () => {
    const response = await api.get("/appointments/stats");
    return response.data;
  },

  // Deletar (protegido)
  delete: async (id: number) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};
