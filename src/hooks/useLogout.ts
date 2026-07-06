// src/hooks/useLogout.ts
import { useCallback, useState } from "react";
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
  /**
   * Callback executado antes do logout
   */
  onBeforeLogout?: () => void;
  /**
   * Callback executado após o logout
   */
  onAfterLogout?: () => void;
  /**
   * Se true, limpa todos os dados do localStorage (exceto token)
   */
  clearStorage?: boolean;
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
    successMessage = "Logout realizado com sucesso!",
    showToast = true,
    onBeforeLogout,
    onAfterLogout,
    clearStorage = false,
  } = options;

  const navigate = useNavigate();
  const { logout: authLogout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      // ✅ Executar callback antes do logout
      if (onBeforeLogout) {
        onBeforeLogout();
      }

      // ✅ Limpar dados específicos do localStorage se solicitado
      if (clearStorage) {
        const keysToKeep = ["@BarberApp:token", "@BarberApp:user"];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach((key) => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
      }

      // ✅ Executar o logout do contexto de autenticação
      authLogout();

      // ✅ Exibir toast de sucesso
      if (showToast) {
        toast.success(successMessage);
      }

      // ✅ Executar callback após o logout
      if (onAfterLogout) {
        onAfterLogout();
      }

      // ✅ Redirecionar para a home ou rota especificada
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Erro durante logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setIsLoggingOut(false);
    }
  }, [
    authLogout,
    navigate,
    redirectTo,
    showToast,
    successMessage,
    onBeforeLogout,
    onAfterLogout,
    clearStorage,
  ]);

  return {
    logout,
    isLoggingOut,
    isAuthenticated,
  };
};
