// src/components/Auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader size={50} color="#3B82F6" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
