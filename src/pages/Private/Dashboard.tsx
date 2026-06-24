// src/pages/Private/Dashboard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ScissorsIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockCounterClockwiseIcon,
  MoneyIcon,
  ArrowRightIcon,
  ListIcon,
  PlusCircleIcon,
  CalendarPlusIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Common/Spinner";
import { RescheduleModal } from "../../components/Common/RescheduleModal";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import {
  getTemporalStatus,
  sortByTemporalPriority,
  canRescheduleAppointment,
} from "../../utils/appointmentStatus";
import type {
  Appointment,
  AppointmentStats,
  StatusType,
  Product,
} from "../../types";

export const Dashboard = () => {
  const { user } = useAuth();
  const { loading, handleRequest, endpoints } = useApi();

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [services, setServices] = useState<Product[]>([]);

  // Estado para o modal de reagendamento
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  // ✅ Memoizar agendamentos ordenados por prioridade temporal
  const sortedTodayAppointments = useMemo(() => {
    return sortByTemporalPriority(todayAppointments);
  }, [todayAppointments]);

  const sortedUpcomingAppointments = useMemo(() => {
    return sortByTemporalPriority(upcomingAppointments);
  }, [upcomingAppointments]);

  // Função auxiliar para extrair array de qualquer resposta
  const extractArray = (data: any, fallback: any[] = []): any[] => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.appointments && Array.isArray(data.appointments))
      return data.appointments;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.list && Array.isArray(data.list)) return data.list;

    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    return fallback;
  };

  // ✅ Buscar serviços para reagendamento
  const fetchServices = useCallback(async () => {
    try {
      const data = await handleRequest(endpoints.products.findActive());
      setServices(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Serviços não disponíveis:", error);
      }
      setServices([]);
    }
  }, [handleRequest, endpoints.products]);

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const [todayData, statsData, upcomingData] = await Promise.all([
          handleRequest(endpoints.appointments.findToday()),
          handleRequest(endpoints.appointments.getStats()),
          handleRequest(endpoints.appointments.findUpcoming(5)),
        ]);

        const todayList = extractArray(todayData, []);
        const upcomingList = extractArray(upcomingData, []);

        setTodayAppointments(todayList);
        setUpcomingAppointments(upcomingList);
        setStats(statsData as AppointmentStats);
        await fetchServices();

        // Mensagem informativa se não houver agendamentos hoje
        if (todayList.length === 0 && statsData?.pending > 0) {
          toast.info(
            `📅 Você tem ${statsData.pending} agendamento(s) pendente(s) para outros dias`,
          );
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Erro ao carregar dashboard";
        toast.error(`❌ ${message}`);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [handleRequest, fetchServices]);

  // ✅ Função para reagendar
  const handleReschedule = async (newDate: string, newTime: string) => {
    if (!appointmentToReschedule) {
      toast.error("Agendamento não encontrado");
      return;
    }

    try {
      await handleRequest(
        endpoints.appointments.reschedule(appointmentToReschedule.id, {
          appointment_date: newDate,
          appointment_time: newTime,
        }),
      );
      toast.success("📅 Agendamento reagendado com sucesso!");

      // Recarregar dados
      const [todayData, upcomingData] = await Promise.all([
        handleRequest(endpoints.appointments.findToday()),
        handleRequest(endpoints.appointments.findUpcoming(5)),
      ]);

      setTodayAppointments(extractArray(todayData, []));
      setUpcomingAppointments(extractArray(upcomingData, []));

      setShowRescheduleModal(false);
      setAppointmentToReschedule(null);
    } catch (error: any) {
      console.error("Erro ao reagendar:", error);
      const message =
        error.response?.data?.message || "Erro ao reagendar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // Função para abrir modal de reagendamento
  const openRescheduleModal = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  // ✅ Confirmar agendamento com validação de status temporal
  const handleConfirm = async (id: number, appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
    );

    if (temporalStatus.isPast || temporalStatus.isLate) {
      toast.warning(
        "⚠️ Este agendamento está atrasado ou já passou. Considere reagendar ou cancelar.",
      );
      return;
    }

    try {
      await handleRequest(endpoints.appointments.confirm(id));
      toast.success("✅ Agendamento confirmado!");

      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "confirmed" as StatusType } : app,
        ),
      );

      if (stats) {
        setStats({
          ...stats,
          pending: Math.max(0, stats.pending - 1),
          confirmed: stats.confirmed + 1,
        });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Erro ao confirmar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Finalizar atendimento com validação
  const handleComplete = async (id: number, appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
    );

    if (
      !temporalStatus.isPast &&
      !temporalStatus.isLate &&
      !temporalStatus.label.includes("Em andamento")
    ) {
      toast.warning(
        "⚠️ Este agendamento ainda não começou. Aguarde o horário para finalizar.",
      );
      return;
    }

    try {
      await handleRequest(endpoints.appointments.complete(id));
      toast.success("✅ Atendimento finalizado!");

      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "completed" as StatusType } : app,
        ),
      );

      if (stats) {
        setStats({
          ...stats,
          confirmed: Math.max(0, stats.confirmed - 1),
          completed: stats.completed + 1,
        });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Erro ao finalizar atendimento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Cancelar agendamento
  const handleCancel = async (id: number) => {
    try {
      await handleRequest(
        endpoints.appointments.cancel(id, "Cancelado pelo barbeiro"),
      );
      toast.info("❌ Agendamento cancelado!");

      const appointment = todayAppointments.find((a) => a.id === id);

      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "cancelled" as StatusType } : app,
        ),
      );

      if (stats && appointment) {
        const updatedStats = { ...stats };
        if (appointment.status === "pending") {
          updatedStats.pending = Math.max(0, stats.pending - 1);
        } else if (appointment.status === "confirmed") {
          updatedStats.confirmed = Math.max(0, stats.confirmed - 1);
        }
        updatedStats.cancelled = stats.cancelled + 1;
        setStats(updatedStats);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Erro ao cancelar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Função para obter ações disponíveis baseadas no status temporal
  const getAvailableActions = (appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
    );

    const actions = [];

    // Confirmar (apenas se não estiver atrasado/passado)
    if (
      appointment.status === "pending" &&
      !temporalStatus.isPast &&
      !temporalStatus.isLate
    ) {
      actions.push({
        key: "confirm",
        label: "Confirmar",
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleConfirm(appointment.id, appointment),
        className: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
      });
    }

    // Finalizar (apenas se estiver em andamento, atrasado ou passado)
    if (
      appointment.status === "confirmed" &&
      (temporalStatus.isPast ||
        temporalStatus.isLate ||
        temporalStatus.label.includes("Em andamento"))
    ) {
      actions.push({
        key: "complete",
        label: "Finalizar",
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleComplete(appointment.id, appointment),
        className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
      });
    }

    // Reagendar (disponível para atrasados/passados ou sempre para pending/confirmed)
    if (
      appointment.status === "pending" ||
      appointment.status === "confirmed" ||
      canRescheduleAppointment(temporalStatus)
    ) {
      actions.push({
        key: "reschedule",
        label: "Reagendar",
        icon: <CalendarPlusIcon size={16} />,
        onClick: () => openRescheduleModal(appointment),
        className: "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
      });
    }

    // Cancelar (sempre disponível)
    actions.push({
      key: "cancel",
      label: "Cancelar",
      icon: <XCircleIcon size={16} />,
      onClick: () => handleCancel(appointment.id),
      className: "bg-red-500/20 text-red-500 hover:bg-red-500/30",
    });

    return actions;
  };

  const getStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendente",
        className: "badge-gold",
      },
      confirmed: {
        label: "Confirmado",
        className:
          "badge-dark bg-green-500/10 text-green-500 border-green-500/30",
      },
      completed: {
        label: "Concluído",
        className: "badge-dark bg-blue-500/10 text-blue-500 border-blue-500/30",
      },
      cancelled: {
        label: "Cancelado",
        className: "badge-dark bg-red-500/10 text-red-500 border-red-500/30",
      },
    };
    return statusMap[status] || statusMap.pending;
  }, []);

  // SEO: Título da página
  useEffect(() => {
    document.title = "Dashboard | Barbearia";
  }, []);

  if (loading || loadingStats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Olá, {user?.name || "Barbeiro"} 👋
          </h1>
          <p className="text-text-muted text-sm">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          to="/agendamentos"
          className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
          aria-label="Ver todos os agendamentos"
        >
          <ListIcon size={20} />
          Ver todos
        </Link>
      </header>

      {/* Cards de Estatísticas */}
      <section aria-label="Estatísticas do dia">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Total</p>
                <p className="text-2xl font-bold text-text">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg" aria-hidden="true">
                <CalendarIcon size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="card-primary border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {stats?.pending || 0}
                </p>
              </div>
              <div
                className="p-2 bg-yellow-500/10 rounded-lg"
                aria-hidden="true"
              >
                <ClockCounterClockwiseIcon
                  size={24}
                  className="text-yellow-500"
                />
              </div>
            </div>
          </div>

          <div className="card-primary border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Confirmados</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats?.confirmed || 0}
                </p>
              </div>
              <div
                className="p-2 bg-green-500/10 rounded-lg"
                aria-hidden="true"
              >
                <CheckCircleIcon size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="card-primary border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Receita</p>
                <p className="text-2xl font-bold text-accent">
                  {formatPrice(Number(stats?.total_revenue) || 0)}
                </p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg" aria-hidden="true">
                <MoneyIcon size={24} className="text-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agendamentos de Hoje */}
        <section className="lg:col-span-2">
          <header className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-text">
              📅 Agendamentos de Hoje
            </h2>
            <span className="text-text-muted text-sm">
              {sortedTodayAppointments.length} agendamentos
            </span>
          </header>

          {sortedTodayAppointments.length === 0 ? (
            <div className="card-primary text-center py-12">
              <div className="text-5xl mb-4" aria-hidden="true">
                📭
              </div>
              <p className="text-text font-semibold">
                Nenhum agendamento para hoje
              </p>
              <p className="text-text-muted text-sm mt-1">
                {stats?.pending && stats.pending > 0
                  ? `Você tem ${stats.pending} agendamento(s) pendente(s) para outros dias`
                  : "Aproveite para organizar a agenda ou adicionar novos serviços"}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  to="/agendamentos"
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
                >
                  <ListIcon size={18} />
                  Ver todos
                </Link>
                <Link
                  to="/servicos-admin"
                  className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4"
                >
                  <PlusCircleIcon size={18} />
                  Adicionar serviço
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTodayAppointments.map((appointment) => {
                const status = getStatusBadge(appointment.status);
                const temporalStatus = getTemporalStatus(
                  appointment.appointment_date,
                  appointment.appointment_time,
                );
                const actions = getAvailableActions(appointment);

                return (
                  <article
                    key={appointment.id}
                    className={`card-primary hover:border-accent/30 transition-all duration-200 ${
                      temporalStatus.isLate || temporalStatus.isPast
                        ? "border-red-500/30 bg-red-500/5"
                        : temporalStatus.label.includes("Começa em")
                          ? "border-green-500/30 bg-green-500/5"
                          : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-text">
                            {appointment.client?.name || "Cliente"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <ClockIcon size={14} aria-hidden="true" />
                              {appointment.appointment_time}
                            </span>
                            <span
                              className="w-1 h-1 bg-text-muted rounded-full"
                              aria-hidden="true"
                            ></span>
                            <span className="flex items-center gap-1">
                              <ScissorsIcon size={14} aria-hidden="true" />
                              {appointment.service?.name || "Serviço"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status temporal do atendimento */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${temporalStatus.className}`}
                        >
                          {temporalStatus.label}
                        </span>

                        {/* Status do agendamento */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>

                        {/* Ações dinâmicas */}
                        <div className="flex gap-1">
                          {actions.map((action) => (
                            <button
                              key={action.key}
                              onClick={action.onClick}
                              className={`p-1.5 rounded-lg transition ${action.className}`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Sidebar - Próximos Agendamentos com status temporal e ações */}
        <aside className="space-y-6">
          <section>
            <h2 className="font-serif text-xl font-bold text-text mb-4">
              📌 Próximos
            </h2>
            {sortedUpcomingAppointments.length === 0 ? (
              <div className="card-primary text-center py-8">
                <div className="text-4xl mb-2" aria-hidden="true">
                  📅
                </div>
                <p className="text-text-muted text-sm">
                  Nenhum agendamento futuro
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Os próximos agendamentos aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedUpcomingAppointments.map((app) => {
                  const temporalStatus = getTemporalStatus(
                    app.appointment_date,
                    app.appointment_time,
                  );
                  const actions = getAvailableActions(app);

                  return (
                    <article
                      key={app.id}
                      className={`card-primary p-3 hover:border-accent/30 transition ${
                        temporalStatus.isLate || temporalStatus.isPast
                          ? "border-red-500/30 bg-red-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-text text-sm">
                            {app.client?.name || "Cliente"}
                          </p>
                          <p className="text-text-muted text-xs">
                            {formatDate(app.appointment_date)} •{" "}
                            {app.appointment_time}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${temporalStatus.className}`}
                          >
                            {temporalStatus.label}
                          </span>
                          <span className="badge-gold text-[10px]">
                            {app.service?.name || "Serviço"}
                          </span>
                          {/* Ações rápidas para próximos agendamentos */}
                          <div className="flex gap-1 mt-1">
                            {actions.slice(0, 2).map((action) => (
                              <button
                                key={action.key}
                                onClick={action.onClick}
                                className={`p-1 rounded-lg transition ${action.className}`}
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Ações Rápidas */}
          <section>
            <h2 className="font-serif text-xl font-bold text-text mb-4">
              ⚡ Ações Rápidas
            </h2>
            <nav className="space-y-2" aria-label="Ações rápidas">
              <Link
                to="/agendamentos"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Gerenciar Agendamentos</span>
                <ArrowRightIcon
                  size={20}
                  className="text-accent"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/clientes"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Ver Clientes</span>
                <ArrowRightIcon
                  size={20}
                  className="text-accent"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/servicos-admin"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Gerenciar Serviços</span>
                <ArrowRightIcon
                  size={20}
                  className="text-accent"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/agenda"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Configurar Agenda</span>
                <ArrowRightIcon
                  size={20}
                  className="text-accent"
                  aria-hidden="true"
                />
              </Link>
            </nav>
          </section>
        </aside>
      </div>

      {/* Modal de Reagendamento */}
      <RescheduleModal
        key={appointmentToReschedule?.id || "modal"}
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setAppointmentToReschedule(null);
        }}
        onConfirm={handleReschedule}
        appointment={appointmentToReschedule}
        services={services}
      />
    </main>
  );
};

export default Dashboard;
