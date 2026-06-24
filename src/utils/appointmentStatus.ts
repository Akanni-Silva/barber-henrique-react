// src/utils/appointmentStatus.ts
import type { Appointment } from "../types";

export interface TemporalStatus {
  label: string;
  className: string;
  icon?: string;
  priority: number;
  isPast: boolean;
  isLate: boolean;
  isUpcoming: boolean;
  minutesDiff: number;
}

/**
 * Calcula o status temporal de um agendamento
 */
export const getTemporalStatus = (
  appointmentDate: string,
  appointmentTime: string,
  currentTime: Date = new Date(),
): TemporalStatus => {
  // Extrair hora e minuto do agendamento
  const [hours, minutes] = appointmentTime.split(":").map(Number);

  // Criar objeto Date para o agendamento
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  // Calcular diferença em minutos
  const diffMinutes = Math.floor(
    (appointmentDateTime.getTime() - currentTime.getTime()) / 1000 / 60,
  );

  // Verificar se o agendamento é hoje
  const isToday = appointmentDate === currentTime.toISOString().split("T")[0];

  // Se não for hoje
  if (!isToday) {
    const isFuture = appointmentDateTime > currentTime;
    return {
      label: isFuture ? "📅 Futuro" : "📅 Passado",
      className: isFuture
        ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
        : "bg-gray-500/10 text-gray-500 border-gray-500/30",
      priority: isFuture ? 5 : 6,
      isPast: !isFuture,
      isLate: false,
      isUpcoming: isFuture,
      minutesDiff: diffMinutes,
    };
  }

  // Regras para agendamentos de hoje
  if (diffMinutes < -15) {
    return {
      label: "🔴 Muito Atrasado",
      className: "bg-red-500/20 text-red-500 border-red-500/40 font-bold",
      priority: 1,
      isPast: true,
      isLate: true,
      isUpcoming: false,
      minutesDiff: diffMinutes,
    };
  } else if (diffMinutes < -5) {
    return {
      label: "🟡 Atrasado",
      className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      priority: 2,
      isPast: true,
      isLate: true,
      isUpcoming: false,
      minutesDiff: diffMinutes,
    };
  } else if (diffMinutes < 0) {
    return {
      label: "⏳ Em andamento",
      className: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      priority: 3,
      isPast: false,
      isLate: false,
      isUpcoming: true,
      minutesDiff: diffMinutes,
    };
  } else if (diffMinutes <= 15) {
    return {
      label: `🟢 Começa em ${diffMinutes}min`,
      className: "bg-green-500/20 text-green-500 border-green-500/30",
      priority: 4,
      isPast: false,
      isLate: false,
      isUpcoming: true,
      minutesDiff: diffMinutes,
    };
  } else {
    return {
      label: "📅 Futuro",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      priority: 5,
      isPast: false,
      isLate: false,
      isUpcoming: true,
      minutesDiff: diffMinutes,
    };
  }
};

/**
 * Verifica se um agendamento pode ser confirmado
 */
export const canConfirmAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return !temporalStatus.isPast && !temporalStatus.isLate;
};

/**
 * Verifica se um agendamento pode ser finalizado
 */
export const canCompleteAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return (
    temporalStatus.isPast ||
    temporalStatus.isLate ||
    temporalStatus.label.includes("Em andamento")
  );
};

/**
 * Verifica se um agendamento pode ser reagendado
 */
export const canRescheduleAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return temporalStatus.isPast || temporalStatus.isLate;
};

/**
 * Verifica se um agendamento pode ser cancelado
 */
export const canCancelAppointment = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  temporalStatus: TemporalStatus,
): boolean => {
  return true; // Sempre pode cancelar
};

/**
 * ✅ Ordena agendamentos por prioridade de status temporal
 * (Atrasados aparecem primeiro, depois os que estão começando)
 */
export const sortByTemporalPriority = (
  appointments: Appointment[],
): Appointment[] => {
  const now = new Date();
  return [...appointments].sort((a: Appointment, b: Appointment) => {
    const statusA = getTemporalStatus(
      a.appointment_date,
      a.appointment_time,
      now,
    );
    const statusB = getTemporalStatus(
      b.appointment_date,
      b.appointment_time,
      now,
    );
    return statusA.priority - statusB.priority;
  });
};
