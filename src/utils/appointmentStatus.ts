/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/appointmentStatus.ts
import type { Appointment, TemporalStatus } from "../types";

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date
 * sem problemas de timezone, usando a mesma lógica do formatDate
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
 * Verifica se uma data é futura em relação a outra (ignorando horário)
 */
const isDateFuture = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() > date2.getFullYear() ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() > date2.getMonth()) ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() > date2.getDate())
  );
};

/**
 * Calcula o status temporal de um agendamento
 * - Só classifica como "Atrasado" ou "Começa em" se for HOJE
 * - Agendamentos futuros (outras datas) são "Futuro"
 * - Agendamentos passados (outras datas) são "Passado"
 */
export const getTemporalStatus = (
  appointmentDate: string,
  appointmentTime: string,
  currentTime: Date = new Date(),
): TemporalStatus => {
  // ✅ Criar data do agendamento usando parseDateSafe
  const appointmentDateObj = parseDateSafe(appointmentDate);

  // Extrair hora e minuto do agendamento
  const [hours, minutes] = appointmentTime.split(":").map(Number);
  appointmentDateObj.setHours(hours, minutes, 0, 0);

  // ✅ Criar data de hoje (sem horário)
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  // ✅ Verificar se é hoje usando isSameDay
  const isToday = isSameDay(appointmentDateObj, today);

  // Calcular diferença em minutos
  const diffMinutes = Math.floor(
    (appointmentDateObj.getTime() - currentTime.getTime()) / 1000 / 60,
  );

  // ✅ Se não for hoje, classificar como Futuro ou Passado
  if (!isToday) {
    const isFuture = isDateFuture(appointmentDateObj, today);

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
 * ✅ Pode confirmar: Futuro, Começa em, Em andamento
 * ❌ Não pode confirmar: Atrasado, Muito Atrasado, Passado
 */
export const canConfirmAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return !temporalStatus.isPast && !temporalStatus.isLate;
};

/**
 * Verifica se um agendamento pode ser finalizado
 * ✅ Pode finalizar: Em andamento, Atrasado, Muito Atrasado, Passado
 * ❌ Não pode finalizar: Futuro, Começa em
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
 * ✅ Pode reagendar: Atrasado, Muito Atrasado, Passado
 * ❌ Não pode reagendar: Futuro, Começa em, Em andamento
 */
export const canRescheduleAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return temporalStatus.isPast || temporalStatus.isLate;
};

/**
 * Verifica se um agendamento pode ser cancelado
 * ✅ Sempre pode cancelar
 */
export const canCancelAppointment = (
  temporalStatus: TemporalStatus,
): boolean => {
  return true;
};

/**
 * Ordena agendamentos por prioridade de status temporal
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
