/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Auth/RegisterForm.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserIcon,
  EnvelopeIcon,
  LockIcon,
  PhoneIcon,
  ArrowLeftIcon,
  UserPlusIcon,
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-md mx-auto">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
          <UserPlusIcon size={28} className="text-accent" weight="bold" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text">Criar Conta</h2>
        <p className="text-text-muted text-sm mt-1">
          Registre sua barbearia pela primeira vez
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <Input
          label="Nome Completo"
          type="text"
          name="name"
          placeholder="Carlos Silva"
          icon={<UserIcon size={20} />}
          iconPosition="left"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="name"
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="carlos@barbearia.com"
          icon={<EnvelopeIcon size={20} />}
          iconPosition="left"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="email"
        />

        {/* Senha */}
        <div>
          <Input
            label="Senha"
            type="password"
            name="password"
            placeholder="********"
            icon={<LockIcon size={20} />}
            iconPosition="left"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
            minLength={6}
            helperText="Mínimo de 6 caracteres"
          />
        </div>

        {/* Telefone */}
        <Input
          label="Telefone"
          type="tel"
          name="phone"
          placeholder="+5511999999999"
          icon={<PhoneIcon size={20} />}
          iconPosition="left"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="tel"
          helperText="Formato: +55 (DDD) 99999-9999"
        />

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 text-base bg-accent text-primary-dark font-semibold rounded-lg hover:bg-accent-hover transition-all duration-300 shadow-gold hover:shadow-gold-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
            </>
          )}
        </button>
      </form>

      {/* Link para login */}
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition text-sm group"
        >
          <ArrowLeftIcon size={16} className="group-hover:text-accent" />
          <span>Já tem conta? Faça login</span>
        </Link>
      </div>
    </div>
  );
};
