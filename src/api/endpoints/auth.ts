import { api } from "../axiosConfig";

export const authEndpoint = {
  // ✅ Verificar se pode registrar
  checkRegister: async () => {
    const response = await api.get("/auth/check-register");
    return response.data;
  },

  // ✅ Registrar barbeiro (primeiro acesso)
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
};
