import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@BarberApp:token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Erro na requisição";
    toast.error(message);
    return Promise.reject(error);
  },
);
