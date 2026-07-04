// src/components/Auth/LoginForm.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  EnvelopeIcon,
  LockIcon,
  SignInIcon,
  UserPlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "../Common/Input";
import { Spinner } from "../Common/Spinner";
import { ForgotPasswordModal } from "../Common/ForgotPasswordModal";


interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = "/dashboard",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Email ou senha inválidos";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/*  Email - Mobile First */}
        <div className="bg-primary-light rounded-xl p-4 border border-border/50">
          <div className="bg-primary/50 rounded-lg p-1">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<EnvelopeIcon size={18} />}
              iconPosition="left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error && !email ? "Email é obrigatório" : undefined}
              disabled={loading}
              required
              autoComplete="email"
              className="bg-transparent border-0 focus:ring-0 text-sm"
              labelClassName="text-xs"
              containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
            />
          </div>
        </div>

        {/*  Senha - Mobile First */}
        <div className="bg-primary-light rounded-xl p-4 border border-border/50">
          <div className="bg-primary/50 rounded-lg p-1">
            <Input
              id="password"
              label="Senha"
              type="password"
              placeholder="********"
              icon={<LockIcon size={18} />}
              iconPosition="left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && !password ? "Senha é obrigatória" : undefined}
              helperText="Mínimo de 6 caracteres"
              disabled={loading}
              required
              autoComplete="current-password"
              minLength={6}
              className="bg-transparent border-0 focus:ring-0 text-sm"
              labelClassName="text-xs"
              containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
            />
          </div>
        </div>

        {/*  Link Esqueceu a Senha - AGORA FUNCIONAL */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-text-muted text-xs hover:text-accent transition font-medium"
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Mensagem de erro geral */}
        {error && email && password && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/*  Botão de submit - Mobile First */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
        >
          {loading ? (
            <>
              <Spinner color="#1A1A1A" size={10} />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <SignInIcon size={20} />
              <span>Entrar</span>
              <ArrowRightIcon size={16} />
            </>
          )}
        </button>

        {/*  Diferencial - Mobile First */}
        <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
          <CheckCircleIcon size={14} className="text-accent" />
          <span>Login seguro e rápido</span>
        </div>

        {/*  Link para registro - Mobile First */}
        <div className="text-center pt-2">
          <p className="text-text-muted text-sm">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-accent hover:text-accent-light transition font-medium inline-flex items-center gap-1"
            >
              <UserPlusIcon size={16} />
              Registre sua barbearia
            </Link>
          </p>
        </div>
      </form>

      {/*  Modal de Recuperação de Senha */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};
