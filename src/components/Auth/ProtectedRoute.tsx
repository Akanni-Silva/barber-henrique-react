// src/components/Auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../../hooks/useAuth";

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
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader size={50} color="#C9A84C" />
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