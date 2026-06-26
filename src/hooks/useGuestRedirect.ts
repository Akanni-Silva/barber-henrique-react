// src/hooks/useGuestRedirect.ts
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

interface UseGuestRedirectOptions {
  /**
   * Rota para redirecionar usuários não logados (padrão: '/')
   */
  redirectTo?: string;
  /**
   * Mensagem do toast ao redirecionar
   */
  toastMessage?: string;
  /**
   * Se true, exibe um toast informativo
   */
  showToast?: boolean;
  /**
   * Delay em ms para exibir o toast antes do redirecionamento
   */
  toastDelay?: number;
}

/**
 * Hook para redirecionar usuários não logados para a home
 * Útil para páginas que requerem autenticação (Private Routes)
 *
 * @example
 * // Em uma página privada
 * useGuestRedirect();
 *
 * @example
 * // Com redirecionamento personalizado
 * useGuestRedirect({
 *   redirectTo: '/login',
 *   toastMessage: 'Faça login para acessar esta página'
 * });
 */
export const useGuestRedirect = (options: UseGuestRedirectOptions = {}) => {
  const {
    redirectTo = "/",
    toastMessage = "Faça login para acessar esta página",
    showToast = true,
    toastDelay = 300,
  } = options;

  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const toastShown = useRef(false);
  const previousAuthState = useRef<boolean | null>(null);
  const navigationDone = useRef(false);

  useEffect(() => {
    // Aguardar o carregamento da autenticação
    if (loading) return;

    // ✅ Detectar se o usuário acabou de fazer logout
    const justLoggedOut =
      previousAuthState.current === true && isAuthenticated === false;

    // ✅ Atualizar o estado anterior
    previousAuthState.current = isAuthenticated;

    // ✅ Apenas redirecionar se o usuário NÃO estiver logado
    if (!isAuthenticated) {
      // ✅ Exibir toast antes do redirecionamento
      const shouldShowToast =
        showToast && !justLoggedOut && !toastShown.current;

      if (shouldShowToast) {
        toastShown.current = true;
        toast.warning(toastMessage);
      }

      // ✅ Redirecionar com delay
      if (!navigationDone.current) {
        navigationDone.current = true;

        const timer = setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, toastDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // ✅ Resetar o navigationDone quando o usuário está logado
      navigationDone.current = false;
    }
  }, [
    isAuthenticated,
    loading,
    navigate,
    redirectTo,
    showToast,
    toastMessage,
    toastDelay,
  ]);
};
