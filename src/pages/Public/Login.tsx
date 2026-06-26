// src/pages/Public/Login.tsx
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/Auth/LoginForm";
import { ScissorsIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  useAuthRedirect({
    redirectTo: "/dashboard",
    toastMessage: "Você já está logado! Acesse seu dashboard.",
    showToast: true,
    toastDelay: 500,
  });

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-4">
      <div className="w-full max-w-sm px-4">
        {/* ✅ Botão Voltar */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition mb-6 group"
        >
          <ArrowLeftIcon
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-xs">Voltar</span>
        </button>

        {/* ✅ Logo e título - Compacto */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-accent/20 shadow-glow">
            <ScissorsIcon size={28} className="text-accent" weight="fill" />
          </div>
          <h1 className="font-serif text-xl font-bold text-text">
            Henrique Cortes
          </h1>
          <p className="text-text-muted text-xs mt-0.5">Área do Barbeiro</p>
        </div>

        {/* ✅ Formulário de Login */}
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};
