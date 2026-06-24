/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Common/RescheduleModal.tsx
import React, { useState, useEffect } from "react";
import { XIcon, CalendarIcon, ClockIcon } from "@phosphor-icons/react";
import { Input } from "./Input";
import { Spinner } from "./Spinner";
import type { Appointment, Product } from "../../types";
import { toast } from "react-toastify";
import { formatPrice } from "../../utils/formatPrice";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
  appointment: Appointment | null;
  services?: Product[];
  isLoading?: boolean;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  services,
  isLoading = false,
}) => {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedService, setSelectedService] = useState<number | undefined>(
    appointment?.service_id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewDate(appointment.appointment_date);
      setNewTime(appointment.appointment_time.substring(0, 5));
      setSelectedService(appointment.service_id);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate || !newTime) {
      toast.warning("Selecione uma nova data e horário");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(newDate, newTime);
      onClose();
    } catch (error) {
      console.error("Erro ao reagendar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-light rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl font-bold text-text">
            📅 Reagendar Agendamento
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition"
            disabled={isSubmitting || isLoading}
          >
            <XIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações atuais */}
          <div className="bg-primary p-3 rounded-lg space-y-1">
            <p className="text-text-muted text-sm">Agendamento atual</p>
            <p className="text-text font-medium">
              {appointment.client?.name || "Cliente"}
            </p>
            <p className="text-text-muted text-sm">
              {new Date(appointment.appointment_date).toLocaleDateString(
                "pt-BR",
              )}{" "}
              • {appointment.appointment_time.substring(0, 5)}
            </p>
            <p className="text-text-muted text-sm">
              {appointment.service?.name || "Serviço"}
            </p>
          </div>

          {/* Nova data */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nova Data
            </label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              disabled={isSubmitting || isLoading}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Novo horário */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Novo Horário
            </label>
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Serviço (opcional) */}
          {services && services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Serviço
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(Number(e.target.value))}
                className="input-primary"
                disabled={isSubmitting || isLoading}
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatPrice(service.price)} (
                    {service.duration_minutes}min)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light"
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Spinner color="#1A1A1A" size={10} />
                  <span>Reagendando...</span>
                </>
              ) : (
                <>
                  <CalendarIcon size={18} />
                  <span>Reagendar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
