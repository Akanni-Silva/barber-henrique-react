import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoginForm } from "../../components/Auth/LoginForm";
import { ScissorsIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

export const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Logo decorativa */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-accent">
            <ScissorsIcon size={24} weight="fill" />
            <span className="font-serif text-xl font-bold">
              Henrique Cortes
            </span>
          </div>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};
