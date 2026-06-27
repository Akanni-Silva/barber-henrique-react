// src/components/Auth/RegisterForm.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserIcon,
  EnvelopeIcon,
  LockIcon,
  PhoneIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { Spinner } from "../Common/Spinner";
import { Input } from "../Common/Input";
import { authEndpoint } from "../../api/endpoints/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authEndpoint.register(formData);
      toast.success("✅ Registro realizado com sucesso! Faça login.");
      onSuccess?.();
      navigate("/login");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || "Erro ao registrar";
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ✅ Campos com fundo estilizado - Mobile First */}
      <div className="bg-primary-light rounded-xl p-4 border border-border/50">
        <div className="bg-primary/50 rounded-lg p-1">
          <Input
            label="Nome Completo"
            type="text"
            name="name"
            placeholder="Carlos Silva"
            icon={<UserIcon size={18} />}
            iconPosition="left"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="name"
            className="bg-transparent border-0 focus:ring-0 text-sm"
            labelClassName="text-xs"
            containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
          />
        </div>
      </div>

      <div className="bg-primary-light rounded-xl p-4 border border-border/50">
        <div className="bg-primary/50 rounded-lg p-1">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="carlos@barbearia.com"
            icon={<EnvelopeIcon size={18} />}
            iconPosition="left"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="email"
            className="bg-transparent border-0 focus:ring-0 text-sm"
            labelClassName="text-xs"
            containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
          />
        </div>
      </div>

      <div className="bg-primary-light rounded-xl p-4 border border-border/50">
        <div className="bg-primary/50 rounded-lg p-1">
          <Input
            label="Senha"
            type="password"
            name="password"
            placeholder="********"
            icon={<LockIcon size={18} />}
            iconPosition="left"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
            minLength={6}
            helperText="Mínimo de 6 caracteres"
            className="bg-transparent border-0 focus:ring-0 text-sm"
            labelClassName="text-xs"
            containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
          />
        </div>
      </div>

      <div className="bg-primary-light rounded-xl p-4 border border-border/50">
        <div className="bg-primary/50 rounded-lg p-1">
          <Input
            label="Telefone"
            type="tel"
            name="phone"
            placeholder="+55 (11) 99999-9999"
            icon={<PhoneIcon size={18} />}
            iconPosition="left"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="tel"
            helperText="Ex: +55 (11) 99999-9999"
            className="bg-transparent border-0 focus:ring-0 text-sm"
            labelClassName="text-xs"
            containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* ✅ Botão de submit - Mobile First */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
      >
        {loading ? (
          <>
            <Spinner color="#1A1A1A" size={10} />
            <span>Registrando...</span>
          </>
        ) : (
          <>
            <UserPlusIcon size={20} />
            <span>Criar Conta</span>
            <ArrowRightIcon size={16} />
          </>
        )}
      </button>

      {/* ✅ Diferencial - Mobile First */}
      <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
        <CheckCircleIcon size={14} className="text-accent" />
        <span>Cadastro rápido e seguro</span>
      </div>
    </form>
  );
};
