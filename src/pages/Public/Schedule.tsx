/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Public/Schedule.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useApi } from "../../hooks/useApi";
import { Input } from "../../components/Common/Input";
import { Spinner } from "../../components/Common/Spinner";
import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react";

export const Schedule = () => {
  const navigate = useNavigate();
  const { loading, handleRequest, endpoints } = useApi();

  // Estados
  const [services, setServices] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Dados do cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Estados de submissão
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Buscar serviços disponíveis
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await handleRequest(endpoints.products.findActive());
        setServices(data || []);
        if (data && data.length > 0) {
          setSelectedService(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Erro ao carregar serviços disponíveis");
      }
    };
    fetchServices();
  }, []);

  // Buscar horários disponíveis quando mudar data ou serviço
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedService) return;

      setLoadingSlots(true);
      try {
        const data = await handleRequest(
          endpoints.schedule.getAvailableSlots(selectedDate, 30),
        );
        setAvailableSlots(data?.slots || []);
        setSelectedTime("");
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, selectedService]);

  // Definir data mínima (amanhã)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.warning("Selecione serviço, data e horário");
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      toast.warning("Preencha seus dados de contato");
      return;
    }

    setSubmitting(true);
    try {
      await handleRequest(
        endpoints.appointments.create({
          client_name: clientName,
          client_phone: clientPhone,
          service_id: selectedService,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          notes: notes || undefined,
        }),
      );

      setSuccess(true);
      toast.success("✅ Agendamento realizado com sucesso!");

      // Resetar formulário após 3 segundos
      setTimeout(() => {
        setSuccess(false);
        setClientName("");
        setClientPhone("");
        setNotes("");
        setSelectedTime("");
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao realizar agendamento";
      toast.error(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando serviços...</p>
      </div>
    );
  }

  // Serviço selecionado
  const selectedServiceObj = services.find((s) => s.id === selectedService);

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-text-muted hover:text-accent transition p-2 rounded-lg hover:bg-primary-light"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Agendar Horário
          </h1>
          <p className="text-text-muted text-sm">
            Escolha o serviço, data e horário
          </p>
        </div>
      </div>

      {success ? (
        // ✅ Tela de sucesso
        <div className="card-primary text-center py-12">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckIcon size={40} className="text-green-500" weight="bold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-text mb-2">
            Agendamento Confirmado!
          </h2>
          <p className="text-text-muted mb-4">
            Você receberá a confirmação no WhatsApp em instantes.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary inline-flex items-center gap-2"
          >
            Voltar para Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Serviço */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Selecione o Serviço
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedService === service.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-border-light bg-primary"
                  }`}
                >
                  <div className="text-2xl mb-1">✂️</div>
                  <h4 className="font-semibold text-text text-sm">
                    {service.name}
                  </h4>
                  <p className="text-accent font-bold text-sm">
                    {formatPrice(service.price)}
                  </p>
                  <p className="text-text-muted text-xs">
                    {service.duration_minutes} min
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Horário
              </label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-3">
                  <Spinner color="#C9A84C" size={10} />
                  <span className="text-text-muted text-sm ml-2">
                    Carregando horários...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-primary"
                  required
                  disabled={availableSlots.length === 0}
                >
                  <option value="">Selecione um horário</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              )}
              {availableSlots.length === 0 && selectedDate && !loadingSlots && (
                <p className="text-text-muted text-sm mt-1.5">
                  Nenhum horário disponível para esta data
                </p>
              )}
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-text">
              Seus Dados
            </h3>

            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              icon={<UserIcon size={20} />}
              iconPosition="left"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              disabled={submitting}
            />

            <Input
              label="Telefone"
              type="tel"
              placeholder="+5511999999999"
              icon={<PhoneIcon size={20} />}
              iconPosition="left"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              disabled={submitting}
              helperText="Ex: +5511999999999"
            />

            <Input
              label="Observações (opcional)"
              placeholder="Alguma observação sobre o serviço..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Resumo */}
          {selectedServiceObj && (
            <div className="bg-primary-light rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-text mb-2">
                Resumo do Agendamento
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Serviço:</span>
                  <span className="text-text">{selectedServiceObj.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Preço:</span>
                  <span className="text-accent font-bold">
                    {formatPrice(selectedServiceObj.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Duração:</span>
                  <span className="text-text">
                    {selectedServiceObj.duration_minutes} min
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Data:</span>
                    <span className="text-text">
                      {new Date(selectedDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Horário:</span>
                    <span className="text-text">{selectedTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de submissão */}
          <button
            type="submit"
            disabled={
              submitting || !selectedService || !selectedDate || !selectedTime
            }
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner color="#1A1A1A" size={10} />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <CalendarIcon size={20} />
                <span>Solicitar Agendamento</span>
              </>
            )}
          </button>

          <p className="text-text-muted text-xs text-center">
            Ao solicitar, você receberá a confirmação via WhatsApp.
          </p>
        </form>
      )}
    </div>
  );
};
