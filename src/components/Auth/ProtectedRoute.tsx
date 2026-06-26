// src/components/Auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../../hooks/useAuth";
import { ScissorsIcon } from "@phosphor-icons/react";

interface ProtectedRouteProps {
  requireGuest?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requireGuest = false,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
        <div className="relative">
          {/* ✅ Logo animada */}
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border-2 border-accent/20">
            <ScissorsIcon size={32} className="text-accent" weight="fill" />
          </div>
          {/* ✅ Spinner com estilo personalizado */}
          <div className="flex flex-col items-center gap-3">
            <ClipLoader size={40} color="#C9A84C" />
            <p className="text-text-muted text-sm font-medium animate-pulse">
              Carregando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Se a rota exige estar DESLOGADO e o usuário está LOGADO
  if (requireGuest && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // ✅ Se a rota exige estar LOGADO e o usuário está DESLOGADO
  if (!requireGuest && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
