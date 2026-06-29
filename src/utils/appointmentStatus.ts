// src/utils/appointmentStatus.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Appointment, TemporalStatus } from "../types";

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date
 * sem problemas de timezone
 */
const parseDateSafe = (dateStr: string): Date => {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  return new Date(year, month, day);
};

/**
 * Verifica se duas datas são o mesmo dia (ignorando horário)
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calcula o status temporal de um agendamento
 * ✅ Melhorado: Agora trata corretamente agendamentos concluídos
 */
export const getTemporalStatus = (
  appointmentDate: string,
  appointmentTime: string,
  appointmentStatus: string,
  currentTime: Date = new Date(),
): TemporalStatus => {
  // ✅ Se já foi concluído, retorna status específico
  if (appointmentStatus === "completed") {
    return {
      label: "✅ Concluído",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      priority: 7,
      isPast: true,
      isLate: false,
      isUpcoming: false,
      minutesDiff: 0,
    };
  }

  // ✅ Se foi cancelado, retorna status específico
  if (appointmentStatus === "cancelled") {
    return {
      label: "❌ Cancelado",
      className: "bg-gray-500/10 text-gray-500 border-gray-500/30",
      priority: 8,
      isPast: true,
      isLate: false,
      isUpcoming: false,
      minutesDiff: 0,
    };
  }

  // ✅ Criar data do agendamento
  const appointmentDateObj = parseDateSafe(appointmentDate);
  const [hours, minutes] = appointmentTime.split(":").map(Number);
  appointmentDateObj.setHours(hours, minutes, 0, 0);

  // ✅ Data de hoje (sem horário)
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  // ✅ Verificar se é hoje
  const isToday = isSameDay(appointmentDateObj, today);

  // Calcular diferença em minutos
  const diffMinutes = Math.floor(
    (appointmentDateObj.getTime() - currentTime.getTime()) / 1000 / 60,
  );

  // ✅ Se não for hoje
  if (!isToday) {
    const isFuture = appointmentDateObj > today;
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

  // ✅ Se for hoje, aplicar regras de status temporal
  // Agendamentos confirmados mas que já passaram
  if (diffMinutes < -15 && appointmentStatus === "confirmed") {
    return {
      label: "🔴 Cliente não compareceu",
      className: "bg-red-500/20 text-red-500 border-red-500/40 font-bold",
      priority: 1,
      isPast: true,
      isLate: true,
      isUpcoming: false,
      minutesDiff: diffMinutes,
    };
  }

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
  appointmentStatus: string,
): boolean => {
  // ❌ Não pode confirmar se já foi concluído ou cancelado
  if (appointmentStatus === "completed" || appointmentStatus === "cancelled") {
    return false;
  }
  return !temporalStatus.isPast && !temporalStatus.isLate;
};

/**
 * Verifica se um agendamento pode ser finalizado
 */
export const canCompleteAppointment = (
  temporalStatus: TemporalStatus,
  appointmentStatus: string,
): boolean => {
  // ❌ Não pode finalizar se já foi concluído ou cancelado
  if (appointmentStatus === "completed" || appointmentStatus === "cancelled") {
    return false;
  }
  // ✅ Só pode finalizar se estiver confirmado e em andamento/atrasado/passado
  return (
    appointmentStatus === "confirmed" &&
    (temporalStatus.isPast ||
      temporalStatus.isLate ||
      temporalStatus.label.includes("Em andamento"))
  );
};

/**
 * Verifica se um agendamento pode ser reagendado
 */
export const canRescheduleAppointment = (
  temporalStatus: TemporalStatus,
  appointmentStatus: string,
): boolean => {
  // ❌ Não pode reagendar se já foi concluído ou cancelado
  if (appointmentStatus === "completed" || appointmentStatus === "cancelled") {
    return false;
  }
  // ✅ Pode reagendar se estiver pendente ou confirmado e atrasado/passado
  return (
    appointmentStatus === "pending" ||
    (appointmentStatus === "confirmed" &&
      (temporalStatus.isPast || temporalStatus.isLate))
  );
};

/**
 * Verifica se um agendamento pode ser cancelado
 */
export const canCancelAppointment = (appointmentStatus: string): boolean => {
  // ❌ Não pode cancelar se já foi concluído ou cancelado
  if (appointmentStatus === "completed" || appointmentStatus === "cancelled") {
    return false;
  }
  return true;
};

/**
 * Ordena agendamentos por prioridade de status temporal
 */
export const sortByTemporalPriority = (
  appointments: Appointment[],
): Appointment[] => {
  const now = new Date();
  return [...appointments].sort((a: Appointment, b: Appointment) => {
    const statusA = getTemporalStatus(
      a.appointment_date,
      a.appointment_time,
      a.status,
      now,
    );
    const statusB = getTemporalStatus(
      b.appointment_date,
      b.appointment_time,
      b.status,
      now,
    );
    return statusA.priority - statusB.priority;
  });
};
