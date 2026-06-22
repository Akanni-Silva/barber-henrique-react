// src/pages/Public/Register.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { RegisterForm } from "../../components/Auth/RegisterForm";
import { ScissorsIcon } from "@phosphor-icons/react";

export const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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
          <p className="text-text-muted text-sm mt-1">Barbearia</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
};
