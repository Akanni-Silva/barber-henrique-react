/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Auth/LoginForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  EnvelopeIcon,
  LockIcon,
  SignInIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Input } from "../Common/Input";
import { Spinner } from "../Common/Spinner";

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
    <div className="w-full max-w-md mx-auto">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
          <SignInIcon size={28} className="text-accent" weight="bold" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text">
          Área do Barbeiro
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Acesse sua conta para gerenciar a barbearia
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ✅ Email com componente Input */}
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          icon={<EnvelopeIcon size={20} />}
          iconPosition="left"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email ? "Email é obrigatório" : undefined}
          disabled={loading}
          required
          autoComplete="email"
        />

        {/* ✅ Senha com componente Input */}
        <Input
          id="password"
          label="Senha"
          type="password"
          placeholder="********"
          icon={<LockIcon size={20} />}
          iconPosition="left"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error && !password ? "Senha é obrigatória" : undefined}
          helperText="Mínimo de 6 caracteres"
          disabled={loading}
          required
          autoComplete="current-password"
          minLength={6}
        />

        {/* Mensagem de erro geral */}
        {error && email && password && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botão de submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-70 disabled:cursor-not-allowed"
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
            </>
          )}
        </button>
      </form>

      {/* Link para registro (primeiro acesso) */}
      <div className="mt-6 text-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition text-sm group"
        >
          <UserPlusIcon size={16} className="group-hover:text-accent" />
          <span>Primeiro acesso? Registre sua barbearia</span>
        </Link>
      </div>
    </div>
  );
};
