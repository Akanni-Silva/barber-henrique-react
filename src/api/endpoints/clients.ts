import { api } from "../axiosConfig";

export const clientsEndpoint = {
  // Criar cliente (público)
  create: async (data: { name: string; phone: string; notes?: string }) => {
    const response = await api.post("/clients", data);
    return response.data;
  },

  // Buscar ou criar (público)
  findOrCreate: async (data: { name: string; phone: string }) => {
    const response = await api.post("/clients/find-or-create", data);
    return response.data;
  },

  // Listar clientes (protegido)
  findAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/clients", { params });
    return response.data;
  },

  // Buscar por ID
  findById: async (id: number) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Buscar por telefone
  findByPhone: async (phone: string) => {
    const response = await api.get(`/clients/phone/${phone}`);
    return response.data;
  },

  // Atualizar cliente
  update: async (
    id: number,
    data: { name?: string; phone?: string; notes?: string },
  ) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  // Desativar cliente
  deactivate: async (id: number) => {
    const response = await api.delete(`/clients/${id}/deactivate`);
    return response.data;
  },

  // Ativar cliente
  activate: async (id: number) => {
    const response = await api.post(`/clients/${id}/activate`);
    return response.data;
  },

  // Buscar histórico de agendamentos
  getHistory: async (id: number) => {
    const response = await api.get(`/clients/${id}/history`);
    return response.data;
  },

  // Estatísticas (protegido)
  getStats: async () => {
    const response = await api.get("/clients/stats");
    return response.data;
  },
};
