/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Common/RescheduleModal.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  XIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { Input } from "./Input";
import { Spinner } from "./Spinner";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { formatPrice } from "../../utils/formatPrice";
import { useApi } from "../../hooks/useApi";
import type { Appointment, Product, RescheduleModalProps } from "../../types";

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  services = [],
  isLoading = false,
}) => {
  const { handleRequest, endpoints } = useApi();

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedService, setSelectedService] = useState<number | undefined>(
    appointment?.service_id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchAvailableSlots = useCallback(
    async (date: string, serviceId?: number) => {
      if (!date || fetchInProgress.current) return;

      fetchInProgress.current = true;
      setLoadingSlots(true);

      try {
        let duration = 30;
        if (serviceId && services.length > 0) {
          const service = services.find((s) => s.id === serviceId);
          if (service) {
            duration = service.duration_minutes || 30;
          }
        }

        const data = await handleRequest(
          endpoints.schedule.getAvailableSlots(date, duration),
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

        setNewTime((prevTime) => {
          if (prevTime && !slots.includes(prevTime)) {
            return "";
          }
          return prevTime;
        });

        if (slots.length === 0 && date) {
          console.debug("Nenhum horário disponível para esta data");
        }
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
        fetchInProgress.current = false;
      }
    },
    [handleRequest, endpoints.schedule, services],
  );

  useEffect(() => {
    if (isOpen && newDate) {
      fetchAvailableSlots(newDate, selectedService);
    }
  }, [isOpen, newDate, selectedService, fetchAvailableSlots]);

  useEffect(() => {
    if (isOpen && appointment && isMounted.current) {
      setNewDate(appointment.appointment_date);
      setNewTime(appointment.appointment_time.substring(0, 5));
      setSelectedService(appointment.service_id);
      fetchAvailableSlots(appointment.appointment_date, appointment.service_id);
      isMounted.current = false;
    }

    if (!isOpen) {
      isMounted.current = true;
      setAvailableSlots([]);
      setLoadingSlots(false);
    }
  }, [isOpen, appointment, fetchAvailableSlots]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      fetchInProgress.current = false;
    };
  }, []);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate || !newTime) {
      toast.warning("Selecione uma nova data e horário");
      return;
    }

    if (!availableSlots.includes(newTime)) {
      toast.warning("Este horário não está mais disponível");
      return;
    }

    const formattedTime =
      newTime.includes(":") && newTime.split(":").length === 2
        ? `${newTime}:00`
        : newTime;

    const [year, month, day] = newDate.split("-").map(Number);
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

    if (newDate === todayStr && diffMinutes < -2) {
      toast.warning(
        `Não é possível agendar para um horário que já passou (${formattedTime})`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(newDate, newTime);
      onClose();
    } catch (error: any) {
      console.error("Erro ao reagendar:", error);
      const message = error?.response?.data?.message || "Erro ao reagendar";
      toast.error(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTimeSlots = () => {
    if (loadingSlots) {
      return (
        <div className="flex items-center justify-center py-6">
          <Spinner color="#C9A84C" size={16} />
          <span className="ml-2 text-text-muted text-sm">
            Carregando horários...
          </span>
        </div>
      );
    }

    if (availableSlots.length === 0) {
      return (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🕐</div>
          <p className="text-text-muted text-sm font-medium">
            Nenhum horário disponível
          </p>
          <p className="text-text-muted text-xs mt-1">
            Selecione outra data ou verifique o horário de funcionamento
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
        {availableSlots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setNewTime(slot)}
            className={`
              p-2.5 rounded-xl text-sm font-medium transition-all duration-200
              flex items-center justify-center gap-1
              ${
                newTime === slot
                  ? "bg-accent text-primary-dark shadow-gold scale-[0.97]"
                  : "bg-primary border border-border text-text hover:border-accent/50 hover:bg-accent/5"
              }
            `}
          >
            <ClockIcon
              size={14}
              className={
                newTime === slot ? "text-primary-dark" : "text-text-muted"
              }
            />
            {slot}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-light rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border/50 shadow-2xl">
        {/* ✅ Header com gradiente */}
        <div className="bg-gradient-to-r from-accent/10 to-transparent border-b border-border/50 p-5 sticky top-0 bg-primary-light z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                <CalendarIcon size={20} className="text-accent" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text">
                Reagendar
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
              disabled={isSubmitting || isLoading}
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* ✅ Informações atuais - Card estilizado */}
          <div className="bg-primary/50 rounded-xl p-4 border border-border/50 space-y-1.5">
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
              Agendamento Atual
            </p>
            <p className="text-text font-semibold">
              {appointment.client?.name || "Cliente"}
            </p>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span>
                {new Date(appointment.appointment_date).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
              <span className="w-1 h-1 bg-text-muted rounded-full"></span>
              <span className="flex items-center gap-1">
                <ClockIcon size={14} />
                {appointment.appointment_time.substring(0, 5)}
              </span>
              <span className="w-1 h-1 bg-text-muted rounded-full"></span>
              <span className="text-accent">
                {appointment.service?.name || "Serviço"}
              </span>
            </div>
          </div>

          {/* ✅ Nova Data - Input estilizado */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nova Data
            </label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setNewTime("");
              }}
              required
              disabled={isSubmitting || isLoading || loadingSlots}
              min={new Date().toISOString().split("T")[0]}
              className="bg-primary/50 border-border/50"
            />
          </div>

          {/* ✅ Horários Disponíveis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Horários Disponíveis
              </label>
              {availableSlots.length > 0 && !loadingSlots && (
                <span className="text-xs text-text-muted">
                  {availableSlots.length} disponíveis
                </span>
              )}
            </div>
            {renderTimeSlots()}
            {newTime && availableSlots.includes(newTime) && (
              <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Horário selecionado: {newTime}
              </p>
            )}
          </div>

          {/* ✅ Serviço - Select estilizado */}
          {services && services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Serviço
              </label>
              <select
                value={selectedService || ""}
                onChange={(e) => {
                  const serviceId = Number(e.target.value);
                  setSelectedService(serviceId);
                  setNewTime("");
                  if (newDate) {
                    fetchAvailableSlots(newDate, serviceId);
                  }
                }}
                className="w-full px-4 py-3 bg-primary/50 border border-border/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200 disabled:opacity-50"
                disabled={isSubmitting || isLoading || loadingSlots}
              >
                <option value="">Manter serviço atual</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatPrice(Number(service.price))} (
                    {service.duration_minutes}min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ✅ Botões de ação */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={<ArrowRightIcon size={18} />}
              iconPosition="right"
              loading={isSubmitting || isLoading}
              disabled={
                loadingSlots || !newTime || !availableSlots.includes(newTime)
              }
            >
              Reagendar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
