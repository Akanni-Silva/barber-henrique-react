// src/hooks/useWhatsAppNotification.ts
import { useState, useCallback } from "react";
import { notificationService } from "../services/notificationService";
import { whatsappService } from "../services/whatsappService";
import { toast } from "react-toastify";
import type {
  Appointment,
  Product,
  User,
  WhatsAppNotificationReturn,
} from "../types";

export const useWhatsAppNotification = (
  barber?: User,
  client?: User,
): WhatsAppNotificationReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const getBarber = useCallback(() => {
    const savedBarber = localStorage.getItem("barber_data");
    if (savedBarber) {
      try {
        return JSON.parse(savedBarber);
      } catch {
        return barber;
      }
    }
    return barber;
  }, [barber]);

  const isConfigured = whatsappService.isConfigured();
  const currentBarber = getBarber();
  const hasBarberPhone = !!currentBarber?.phone;

  // ✅ Notificações para o barbeiro
  const notifyBarberNewAppointment = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!currentBarber?.phone) {
        toast.warning("⚠️ Número do barbeiro não configurado");
        return false;
      }

      setIsLoading(true);
      try {
        const result = await notificationService.notifyBarberNewAppointment({
          appointment,
          service,
          barber: currentBarber,
          client,
        });

        if (result) {
          toast.success("📱 Barbeiro notificado sobre novo agendamento!");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [currentBarber, client],
  );

  const notifyBarberConfirmation = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!currentBarber?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyBarberConfirmation({
          appointment,
          service,
          barber: currentBarber,
          client,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentBarber, client],
  );

  const notifyBarberCancellation = useCallback(
    async (appointment: Appointment) => {
      if (!currentBarber?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyBarberCancellation({
          appointment,
          barber: currentBarber,
          client,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentBarber, client],
  );

  const notifyBarberReschedule = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!currentBarber?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyBarberReschedule({
          appointment,
          service,
          barber: currentBarber,
          client,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentBarber, client],
  );

  const notifyBarberDailyReminder = useCallback(
    async (appointments: Appointment[]) => {
      if (!currentBarber?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyBarberDailyReminder(
          appointments,
          currentBarber,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentBarber],
  );

  // ✅ Notificações para o cliente
  const notifyClientNewAppointment = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!client?.phone) {
        console.warn("⚠️ Cliente sem telefone");
        return false;
      }

      setIsLoading(true);
      try {
        const result = await notificationService.notifyClientNewAppointment({
          appointment,
          service,
          barber: currentBarber,
          client,
        });

        if (result) {
          toast.success("📱 Cliente notificado sobre o agendamento!");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentBarber],
  );

  const notifyClientConfirmation = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!client?.phone) return false;

      setIsLoading(true);
      try {
        const result = await notificationService.notifyClientConfirmation({
          appointment,
          service,
          barber: currentBarber,
          client,
        });

        if (result) {
          toast.success("📱 Cliente notificado sobre a confirmação!");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentBarber],
  );

  const notifyClientCancellation = useCallback(
    async (appointment: Appointment) => {
      if (!client?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyClientCancellation({
          appointment,
          barber: currentBarber,
          client,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentBarber],
  );

  const notifyClientReschedule = useCallback(
    async (appointment: Appointment, service?: Product) => {
      if (!client?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyClientReschedule({
          appointment,
          service,
          barber: currentBarber,
          client,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentBarber],
  );

  const notifyClientReminder = useCallback(
    async (appointment: Appointment) => {
      if (!client?.phone) return false;

      setIsLoading(true);
      try {
        return await notificationService.notifyClientReminder(
          appointment,
          client,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const sendCustomMessage = useCallback(async (to: string, message: string) => {
    setIsLoading(true);
    try {
      return await notificationService.sendCustomMessage(to, message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notifyBarberNewAppointment,
    notifyBarberConfirmation,
    notifyBarberCancellation,
    notifyBarberReschedule,
    notifyBarberDailyReminder,
    notifyClientNewAppointment,
    notifyClientConfirmation,
    notifyClientCancellation,
    notifyClientReschedule,
    notifyClientReminder,
    sendCustomMessage,
    isConfigured,
    isLoading,
    hasBarberPhone,
  };
};
