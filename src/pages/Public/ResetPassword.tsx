/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/Public/ResetPassword.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { Input } from "../../components/Common/Input";
import { Spinner } from "../../components/Common/Spinner";
import { authEndpoint } from "../../api/endpoints/auth";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // ✅ Validar token ao carregar
  useEffect(() => {
    if (!token) {
      setError("Token de recuperação não encontrado");
      setIsValidating(false);
      return;
    }
    setIsValidating(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (!token) {
      setError("Token inválido");
      return;
    }

    setLoading(true);
    try {
      await authEndpoint.resetPassword({
        token,
        new_password: password,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      toast.success("✅ Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Erro ao redefinir senha";
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Validando token..." />
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-serif text-xl font-bold text-text mb-2">
            Token Inválido
          </h2>
          <p className="text-text-muted text-sm mb-6">
            O link de recuperação é inválido ou expirou.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            <ArrowLeftIcon size={18} />
            Voltar para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-sm">
        {/* ✅ Botão Voltar */}
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition mb-6 group active:scale-[0.97]"
        >
          <ArrowLeftIcon
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* ✅ Logo e título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/20 shadow-glow">
            <LockIcon size={32} className="text-accent" weight="fill" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Redefinir Senha
          </h1>
          <p className="text-text-muted text-sm mt-1">Digite sua nova senha</p>
        </div>

        {success ? (
          // ✅ Estado de sucesso
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
              <CheckCircleIcon
                size={36}
                className="text-green-500"
                weight="bold"
              />
            </div>
            <h2 className="font-serif text-xl font-bold text-text mb-2">
              Senha Redefinida! ✅
            </h2>
            <p className="text-text-muted text-sm">
              Sua senha foi alterada com sucesso.
            </p>
            <p className="text-text-muted text-xs mt-2">
              Você será redirecionado para o login em instantes...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ Nova Senha */}
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Nova Senha"
                  type="password"
                  placeholder="********"
                  icon={<LockIcon size={18} />}
                  iconPosition="left"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Mínimo de 6 caracteres"
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
                />
              </div>
            </div>

            {/* ✅ Confirmar Senha */}
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  placeholder="********"
                  icon={<LockIcon size={18} />}
                  iconPosition="left"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* ✅ Botão de submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
            >
              {loading ? (
                <>
                  <Spinner color="#1A1A1A" size={10} />
                  <span>Redefinindo...</span>
                </>
              ) : (
                <>
                  <span>Redefinir Senha</span>
                  <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ✅ Versão do App */}
        <div className="mt-6 text-center">
          <p className="text-text-muted text-[10px]">
            Henrique Cortes Barber v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
