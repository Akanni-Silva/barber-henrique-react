/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Auth/ForgotPasswordModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  XIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "../Common/Input";
import { Spinner } from "../Common/Spinner";
import { authEndpoint } from "../../api/endpoints/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Digite seu email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um email válido");
      return;
    }

    setLoading(true);
    try {
      await authEndpoint.forgotPassword({ email });

      setSuccess(true);
      toast.success("✅ Email de recuperação enviado!");

      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        onClose();
      }, 3000);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Erro ao enviar email";
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-light rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-fadeIn border border-border/50">
        {/* ✅ Header */}
        <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10 rounded-t-2xl">
          <h3 className="font-serif text-lg font-bold text-text">
            Recuperar Senha
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
            disabled={loading}
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-4">
          {success ? (
            // ✅ Estado de sucesso
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
                <CheckCircleIcon
                  size={32}
                  className="text-green-500"
                  weight="bold"
                />
              </div>
              <h4 className="font-semibold text-text text-base mb-2">
                Email Enviado! 📧
              </h4>
              <p className="text-text-muted text-sm">
                Enviamos um link de recuperação para seu email. Verifique sua
                caixa de entrada e spam.
              </p>
              <p className="text-text-muted text-xs mt-2">
                O link expira em 1 hora por segurança.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Descrição */}
              <div className="bg-primary/50 rounded-xl p-3 border border-border/50">
                <p className="text-text-muted text-sm text-center">
                  Digite seu email para receber um link de recuperação de senha.
                </p>
                <p className="text-text-muted text-[10px] text-center mt-1">
                  🔒 Nunca compartilhamos sua senha.
                </p>
              </div>

              {/* ✅ Campo de Email */}
              <div className="bg-primary-light rounded-xl p-4 border border-border/50">
                <div className="bg-primary/50 rounded-lg p-1">
                  <Input
                    id="reset-email"
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    icon={<EnvelopeIcon size={18} />}
                    iconPosition="left"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error || undefined}
                    disabled={loading}
                    required
                    autoComplete="email"
                    className="bg-transparent border-0 focus:ring-0 text-sm"
                    labelClassName="text-xs"
                    containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
                  />
                </div>
              </div>

              {/* ✅ Botões de ação */}
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-3 text-text-secondary hover:text-text transition border border-border rounded-xl hover:border-border-light disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <Spinner color="#1A1A1A" size={10} />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Link</span>
                      <ArrowRightIcon size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
