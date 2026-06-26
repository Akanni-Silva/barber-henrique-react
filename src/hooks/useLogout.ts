// src/hooks/useLogout.ts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

interface UseLogoutOptions {
  /**
   * Rota para redirecionar após o logout (padrão: '/')
   */
  redirectTo?: string;
  /**
   * Mensagem do toast ao fazer logout
   */
  successMessage?: string;
  /**
   * Se true, exibe um toast de sucesso
   */
  showToast?: boolean;
}

/**
 * Hook para gerenciar o logout do usuário
 *
 * @example
 * // Logout simples
 * const logout = useLogout();
 * logout();
 *
 * @example
 * // Logout com redirecionamento personalizado
 * const logout = useLogout({
 *   redirectTo: '/login',
 *   successMessage: 'Até logo!'
 * });
 *
 * @example
 * // Em um componente
 * const { logout, isLoggingOut } = useLogout();
 * <button onClick={logout}>Sair</button>
 */
export const useLogout = (options: UseLogoutOptions = {}) => {
  const {
    redirectTo = "/",
    successMessage = "👋 Logout realizado com sucesso!",
    showToast = true,
  } = options;

  const navigate = useNavigate();
  const { logout: authLogout, isAuthenticated } = useAuth();

  const logout = useCallback(async () => {
    // Executar o logout do contexto de autenticação
    authLogout();

    // Exibir toast de sucesso
    if (showToast) {
      toast.success(successMessage);
    }

    // Redirecionar para a home ou rota especificada
    navigate(redirectTo, { replace: true });
  }, [authLogout, navigate, redirectTo, showToast, successMessage]);

  return {
    logout,
    isAuthenticated,
  };
};
