// src/utils/clientHistory.ts
import type {
  Appointment,
  ClientHistoryStats,
  MonthlyAppointmentsGroup,
} from "../types";

/**
 * Calcula estatísticas do histórico de agendamentos de um cliente
 * @param appointments - Lista de agendamentos do cliente
 * @returns Estatísticas calculadas
 */
export const calculateClientHistoryStats = (
  appointments: Appointment[] = [],
): ClientHistoryStats => {
  // Verificação de segurança
  if (
    !appointments ||
    !Array.isArray(appointments) ||
    appointments.length === 0
  ) {
    return {
      totalAppointments: 0,
      totalSpent: 0,
      averageTicket: 0,
      mostUsedService: "Nenhum",
      lastVisit: null,
      firstVisit: null,
    };
  }

  // ✅ Filtrar apenas agendamentos com status "completed" ou "confirmed" para estatísticas de gasto
  // Mas manter todos para contagem total
  const validAppointments = appointments.filter(
    (app) => app.status === "completed" || app.status === "confirmed",
  );

  // Ordenar por data (mais antigo primeiro)
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointment_date).getTime() -
      new Date(b.appointment_date).getTime(),
  );

  // ✅ Calcular gasto total - usando o preço do serviço
  let totalSpent = 0;
  validAppointments.forEach((app) => {
    const price = Number(app.service?.price) || 0;
    totalSpent += price;
  });

  // ✅ Contar serviços mais usados (considerando apenas completed e confirmed)
  const serviceCount: Record<string, number> = {};
  validAppointments.forEach((app) => {
    const name = app.service?.name || "Serviço";
    serviceCount[name] = (serviceCount[name] || 0) + 1;
  });

  // Se não houver serviços contados, usar todos os appointments
  if (Object.keys(serviceCount).length === 0) {
    appointments.forEach((app) => {
      const name = app.service?.name || "Serviço";
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
  }

  let mostUsedService = "Nenhum";
  let maxCount = 0;
  for (const [name, count] of Object.entries(serviceCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedService = name;
    }
  }

  // ✅ Última visita - considerar apenas completed ou confirmed
  const validSorted = sorted.filter(
    (app) => app.status === "completed" || app.status === "confirmed",
  );

  return {
    totalAppointments: appointments.length,
    totalSpent,
    averageTicket:
      validAppointments.length > 0 ? totalSpent / validAppointments.length : 0,
    mostUsedService,
    lastVisit:
      validSorted.length > 0
        ? validSorted[validSorted.length - 1]?.appointment_date || null
        : null,
    firstVisit:
      validSorted.length > 0 ? validSorted[0]?.appointment_date || null : null,
  };
};

/**
 * Agrupa agendamentos por mês/ano
 * @param appointments - Lista de agendamentos
 * @returns Objeto com agendamentos agrupados por mês
 */
export const groupAppointmentsByMonth = (
  appointments: Appointment[] = [],
): MonthlyAppointmentsGroup => {
  if (
    !appointments ||
    !Array.isArray(appointments) ||
    appointments.length === 0
  ) {
    return {};
  }

  const groups: MonthlyAppointmentsGroup = {};

  appointments.forEach((app) => {
    if (!app?.appointment_date) return;

    const date = new Date(app.appointment_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
  });

  // Ordenar grupos por data (mais recente primeiro)
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as MonthlyAppointmentsGroup);
};

/**
 * Obtém o label do mês/ano para exibição
 * @param yearMonth - String no formato "YYYY-MM"
 * @returns Nome do mês por extenso com ano
 */
export const getMonthLabel = (yearMonth: string): string => {
  if (!yearMonth) return "";

  const [year, month] = yearMonth.split("-").map(Number);
  if (isNaN(year) || isNaN(month)) return yearMonth;

  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Verifica se um cliente tem histórico de agendamentos
 * @param appointments - Lista de agendamentos
 * @returns true se o cliente tem pelo menos um agendamento
 */
export const hasClientHistory = (appointments: Appointment[]): boolean => {
  return appointments && Array.isArray(appointments) && appointments.length > 0;
};

/**
 * Obtém a data do último agendamento do cliente
 * @param appointments - Lista de agendamentos
 * @returns Data do último agendamento ou null
 */
export const getLastAppointmentDate = (
  appointments: Appointment[],
): string | null => {
  if (
    !appointments ||
    !Array.isArray(appointments) ||
    appointments.length === 0
  ) {
    return null;
  }

  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointment_date).getTime() -
      new Date(b.appointment_date).getTime(),
  );

  return sorted[sorted.length - 1]?.appointment_date || null;
};

/**
 * Obtém a data do primeiro agendamento do cliente
 * @param appointments - Lista de agendamentos
 * @returns Data do primeiro agendamento ou null
 */
export const getFirstAppointmentDate = (
  appointments: Appointment[],
): string | null => {
  if (
    !appointments ||
    !Array.isArray(appointments) ||
    appointments.length === 0
  ) {
    return null;
  }

  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointment_date).getTime() -
      new Date(b.appointment_date).getTime(),
  );

  return sorted[0]?.appointment_date || null;
};

/**
 * Calcula o total gasto em um grupo de agendamentos
 * @param appointments - Lista de agendamentos
 * @returns Valor total gasto
 */
export const calculateMonthSpent = (appointments: Appointment[]): number => {
  if (!appointments || !Array.isArray(appointments)) return 0;

  return appointments.reduce((sum, app) => {
    const price = Number(app.service?.price) || 0;
    return sum + price;
  }, 0);
};
