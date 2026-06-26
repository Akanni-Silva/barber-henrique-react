// src/hooks/useAuthRedirect.ts
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

interface UseAuthRedirectOptions {
  redirectTo?: string;
  toastMessage?: string;
  showToast?: boolean;
  toastDelay?: number;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const {
    redirectTo = "/dashboard",
    toastMessage = "Você já está logado! Acesse seu dashboard.",
    showToast = true,
    toastDelay = 300,
  } = options;

  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const toastShown = useRef(false);
  const previousAuthState = useRef<boolean | null>(null);
  const navigationDone = useRef(false);

  useEffect(() => {
    if (loading) return;

    const justLoggedIn =
      previousAuthState.current === false && isAuthenticated === true;

    previousAuthState.current = isAuthenticated;

    if (isAuthenticated) {
      // ✅ Exibir toast antes do redirecionamento
      const shouldShowToast = showToast && !justLoggedIn && !toastShown.current;

      if (shouldShowToast) {
        toastShown.current = true;
        toast.info(toastMessage);
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
