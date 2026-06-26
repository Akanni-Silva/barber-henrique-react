import { api } from "../axiosConfig";

export const productsEndpoint = {
  // Criar produto (protegido)
  create: async (data: {
    name: string;
    price: number;
    duration_minutes: number;
  }) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  // Listar produtos (público)
  findAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Listar apenas ativos (público)
  findActive: async () => {
    const response = await api.get("/products/active");
    return response.data;
  },

  // Buscar por ID (público)
  findById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Atualizar (protegido)
  update: async (
    id: number,
    data: { name?: string; price?: number; duration_minutes?: number },
  ) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Ativar (protegido)
  activate: async (id: number) => {
    const response = await api.patch(`/products/${id}/activate`);
    return response.data;
  },

  // Desativar (protegido)
  deactivate: async (id: number) => {
    const response = await api.patch(`/products/${id}/deactivate`);
    return response.data;
  },

  // Deletar (protegido)
  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Produtos populares (protegido)
  getPopular: async (limit: number = 5) => {
    const response = await api.get("/products/popular", { params: { limit } });
    return response.data;
  },
};
