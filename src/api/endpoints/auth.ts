import type { UpdateProfileData } from "../../types";
import { api } from "../axiosConfig";

export const authEndpoint = {
  // ✅ Registrar barbeiro (validação automática no backend)
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    avatar_url?: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // ✅ Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // ✅ Perfil
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // ✅ Alterar senha
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.patch("/auth/change-password", data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  },

  getPublicProfile: async () => {
    const response = await api.get("/auth/public-profile");
    return response.data;
  },

  // ✅ Solicitar recuperação de senha (NOVO)
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  // ✅ Redefinir senha com token (NOVO)
  resetPassword: async (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },
};
