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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ✅ Formulário com Cards */}
      <div className="bg-primary-light/50 rounded-2xl p-1">
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
          className="bg-transparent border-0 focus:ring-0"
        />
      </div>

      <div className="bg-primary-light/50 rounded-2xl p-1">
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
          className="bg-transparent border-0 focus:ring-0"
        />
      </div>

      {/* ✅ Link Esqueceu a Senha */}
      <div className="text-right">
        <button
          type="button"
          className="text-text-muted text-xs hover:text-accent transition"
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

      {/* ✅ Botão de submit estilizado */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
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

      {/* ✅ Link para registro */}
      <div className="mt-6 text-center">
        <p className="text-text-muted text-sm">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="text-accent hover:text-accent-light transition font-medium inline-flex items-center gap-1"
          >
            <UserPlusIcon size={16} />
            <span>Registre sua barbearia</span>
          </Link>
        </p>
      </div>

      {/* ✅ Diferencial */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
          <span className="text-accent text-xs">✂️</span>
          <span className="text-text-muted text-xs">Desde 2024</span>
          <span className="w-1 h-1 bg-text-muted rounded-full"></span>
          <span className="text-text-muted text-xs">Premium Barber</span>
        </div>
      </div>
    </form>
  );
};
