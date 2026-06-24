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
  ClockIcon,
  ScissorsIcon,
} from "@phosphor-icons/react";

export const Schedule = () => {
  const navigate = useNavigate();
  const { loading, handleRequest, endpoints } = useApi();

  const [services, setServices] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

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
      } catch {
        toast.error("Erro ao carregar serviços disponíveis");
      }
    };
    fetchServices();
  }, []);

  // Buscar horários disponíveis
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedService) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const formattedDate = selectedDate.split("T")[0];
        const isToday = formattedDate === todayStr;

        // Verificar se a barbearia está fechada hoje
        if (isToday) {
          try {
            const workingHours = await handleRequest(
              endpoints.schedule.getTodayWorkingHours(),
            );

            if (!workingHours.is_working) {
              toast.info("📅 Barbearia fechada hoje!");
              setAvailableSlots([]);
              setLoadingSlots(false);
              return;
            }
          } catch {
            // Erro silencioso - continua para tentar buscar slots
          }
        }

        // Buscar slots disponíveis
        const data = await handleRequest(
          endpoints.schedule.getAvailableSlots(formattedDate, 30),
        );

        let slots: string[] = [];
        if (Array.isArray(data)) {
          slots = data;
        } else if (data?.slots && Array.isArray(data.slots)) {
          slots = data.slots;
        } else if (data?.data && Array.isArray(data.data)) {
          slots = data.data;
        } else if (typeof data === "object" && data !== null) {
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              slots = data[key];
              break;
            }
          }
        }

        setAvailableSlots(slots);
        setSelectedTime("");

        if (slots.length === 0 && selectedDate) {
          toast.info("Nenhum horário disponível para esta data");
        }
      } catch {
        setAvailableSlots([]);
        toast.error("Erro ao carregar horários disponíveis");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService]);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.warning("Selecione serviço, data e horário");
      return;
    }

    if (!availableSlots.includes(selectedTime)) {
      toast.warning("Este horário não está mais disponível");
      return;
    }

    const formattedTime =
      selectedTime.includes(":") && selectedTime.split(":").length === 2
        ? `${selectedTime}:00`
        : selectedTime;

    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hours, minutes] = formattedTime.split(":").map(Number);

    const selectedDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0,
    );
    const now = new Date();

    const diffMinutes = (selectedDateTime.getTime() - now.getTime()) / 60000;

    const todayStr = now.toISOString().split("T")[0];
    if (selectedDate === todayStr && diffMinutes < -2) {
      toast.warning(
        `Não é possível agendar para um horário que já passou (${formattedTime})`,
      );
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
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          service_id: selectedService,
          appointment_date: selectedDate,
          appointment_time: formattedTime,
          notes: notes.trim() || undefined,
        }),
      );

      setSuccess(true);
      toast.success("✅ Agendamento realizado com sucesso!");

      setAvailableSlots((prev) => prev.filter((slot) => slot !== selectedTime));
      setSelectedTime("");

      setTimeout(() => {
        setSuccess(false);
        setClientName("");
        setClientPhone("");
        setNotes("");
        setSelectedDate("");
        setAvailableSlots([]);
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao realizar agendamento";
      toast.error(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // SEO: Título da página
  useEffect(() => {
    document.title = "Agendar Horário | Barbearia";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando serviços...</p>
      </div>
    );
  }

  const selectedServiceObj = services.find((s) => s.id === selectedService);

  return (
    <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header com navegação */}
      <nav className="flex items-center gap-3 mb-6" aria-label="Navegação">
        <button
          onClick={() => navigate("/")}
          className="text-text-muted hover:text-accent transition p-2 rounded-lg hover:bg-primary-light"
          aria-label="Voltar para página inicial"
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
      </nav>

      {success ? (
        <section
          className="card-primary text-center py-12"
          aria-label="Confirmação de agendamento"
        >
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
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Seleção de Serviço */}
          <fieldset>
            <legend className="block text-sm font-medium text-text-secondary mb-1.5">
              Selecione o Serviço
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedService === service.id
                      ? "border-accent bg-accent/10 ring-2 ring-accent/20"
                      : "border-border hover:border-border-light bg-primary"
                  }`}
                  aria-pressed={selectedService === service.id}
                >
                  <div className="text-2xl mb-1" aria-hidden="true">
                    <ScissorsIcon size={24} />
                  </div>
                  <h4 className="font-semibold text-text text-sm">
                    {service.name}
                  </h4>
                  <p className="text-accent font-bold text-sm">
                    {formatPrice(service.price)}
                  </p>
                  <p className="text-text-muted text-xs flex items-center gap-1">
                    <ClockIcon size={12} />
                    {service.duration_minutes} min
                  </p>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointment-date" className="block text-sm font-medium text-text-secondary mb-1.5">
                Data
              </label>
              <input
                id="appointment-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="input-primary"
                required
                aria-describedby="date-helper"
              />
              <p id="date-helper" className="text-text-muted text-xs mt-1">
                Agendamento disponível para hoje até 30 dias
              </p>
            </div>
            <div>
              <label htmlFor="appointment-time" className="block text-sm font-medium text-text-secondary mb-1.5">
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
                  id="appointment-time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-primary"
                  required
                  disabled={availableSlots.length === 0}
                  aria-describedby="slots-helper"
                >
                  <option value="">Selecione um horário</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              )}
              <div id="slots-helper" className="mt-1">
                {availableSlots.length === 0 && selectedDate && !loadingSlots && (
                  <p className="text-text-muted text-sm">
                    Nenhum horário disponível para esta data
                  </p>
                )}
                {availableSlots.length > 0 && (
                  <p className="text-text-muted text-xs">
                    {availableSlots.length} horário(s) disponível(is)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-text">
              Seus Dados
            </h2>

            <Input
              label="Nome Completo"
              id="client-name"
              placeholder="Digite seu nome"
              icon={<UserIcon size={20} />}
              iconPosition="left"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              disabled={submitting}
              autoComplete="name"
            />

            <Input
              label="Telefone"
              id="client-phone"
              type="tel"
              placeholder="+5511999999999"
              icon={<PhoneIcon size={20} />}
              iconPosition="left"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              disabled={submitting}
              helperText="Ex: +5511999999999"
              autoComplete="tel"
            />

            <Input
              label="Observações (opcional)"
              id="client-notes"
              placeholder="Alguma observação sobre o serviço..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </section>

          {/* Resumo do Agendamento */}
          {selectedServiceObj && (
            <section className="bg-primary-light rounded-lg p-4 border border-border" aria-label="Resumo do agendamento">
              <h3 className="font-semibold text-text mb-2">
                Resumo do Agendamento
              </h3>
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
            </section>
          )}

          {/* Botão de Submissão */}
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
    </main>
  );
};