// src/pages/Public/Register.tsx
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/Auth/RegisterForm";
import { ScissorsIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export const Register = () => {
  const navigate = useNavigate();

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
            Criar Conta
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            Registre sua barbearia
          </p>
        </div>

        {/* ✅ Formulário de Registro */}
        <RegisterForm />

        {/* ✅ Footer com informações - Compacto */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/5 rounded-full border border-accent/10">
            <span className="text-accent text-[10px]">✂️</span>
            <span className="text-text-muted text-[10px]">100% Grátis</span>
            <span className="w-1 h-1 bg-text-muted rounded-full"></span>
            <span className="text-text-muted text-[10px]">Primeiro acesso</span>
          </div>
        </div>
      </div>
    </div>
  );
};
