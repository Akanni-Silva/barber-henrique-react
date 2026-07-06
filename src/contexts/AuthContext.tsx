/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import { authEndpoint } from "../api/endpoints/auth";
import type { AuthContextData, User } from "../types";

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("@BarberApp:token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authEndpoint.getProfile();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        localStorage.removeItem("@BarberApp:token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authEndpoint.login({ email, password });
      const { token, ...userData } = response;

      localStorage.setItem("@BarberApp:token", token);
      setUser(userData);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao fazer login";
      toast.error(`${message}`);
      throw error;
    }
  };

  const logout = () => {
    // ✅ Remover token
    localStorage.removeItem("@BarberApp:token");

    // ✅ Remover dados do usuário
    localStorage.removeItem("@BarberApp:user");

    // ✅ Limpar outras configurações temporárias
    localStorage.removeItem("@BarberApp:barber_info");
    localStorage.removeItem("whatsapp_config");

    // ✅ Resetar estado do usuário
    setUser(null);

    // ✅ Não exibir toast aqui, pois será exibido pelo hook useLogout
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);

      // ✅ Salvar no localStorage para persistência
      try {
        localStorage.setItem("@BarberApp:user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Erro ao salvar usuário no localStorage:", error);
      }
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem("@BarberApp:token");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
