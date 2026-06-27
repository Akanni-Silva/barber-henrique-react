// src/pages/Public/Register.tsx
import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "../../components/Auth/RegisterForm";
import { ScissorsIcon, ArrowLeftIcon, SignInIcon } from "@phosphor-icons/react";
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
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-sm">
        {/* ✅ Botão Voltar - Mobile First */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition mb-6 group active:scale-[0.97]"
        >
          <ArrowLeftIcon
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* ✅ Logo e título - Mobile First */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/20 shadow-glow">
            <ScissorsIcon size={32} className="text-accent" weight="fill" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Criar Conta
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Registre sua barbearia e comece a usar
          </p>
        </div>

        {/* ✅ Formulário de Registro */}
        <RegisterForm />

        {/* ✅ Footer com informações - Mobile First */}
        <div className="mt-8 space-y-4 text-center">
          {/* Badge de segurança */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
            <span className="text-accent text-xs">✂️</span>
            <span className="text-text-muted text-xs font-medium">
              100% Grátis
            </span>
            <span className="w-1 h-1 bg-text-muted rounded-full"></span>
            <span className="text-text-muted text-xs">Primeiro acesso</span>
          </div>

          {/* Link para login */}
          <div className="mt-4">
            <p className="text-text-muted text-sm">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-accent hover:text-accent-light transition font-medium inline-flex items-center gap-1"
              >
                <SignInIcon size={16} />
                Faça login
              </Link>
            </p>
          </div>

          {/* Versão do App */}
          <p className="text-text-muted text-[10px] mt-4">
            Henrique Cortes Barber v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
