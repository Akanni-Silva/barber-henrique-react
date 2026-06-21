// src/api/endpoints/auth.endpoint.ts

import { api } from "../axiosConfig";

export const authEndpoint = {
  // Registrar barbeiro
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Buscar perfil (autenticado)
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Alterar senha
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.patch("/auth/change-password", data);
    return response.data;
  },
};
