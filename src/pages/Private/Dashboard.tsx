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
import { Button } from "../../components/Common/Button";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
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
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

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

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  const sortedTodayAppointments = useMemo(() => {
    return sortByTemporalPriority(todayAppointments);
  }, [todayAppointments]);

  const sortedUpcomingAppointments = useMemo(() => {
    return sortByTemporalPriority(upcomingAppointments);
  }, [upcomingAppointments]);

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

        if (todayList.length === 0 && statsData?.pending > 0) {
          toast.info(
            `📅 Você tem ${statsData.pending} agendamento(s) pendente(s) para outros dias`,
          );
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Erro ao carregar dashboard";
        toast.error(`${message}`);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [handleRequest, fetchServices]);

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
      toast.error(`${message}`);
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleConfirm = async (id: number, appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
    );

    if (temporalStatus.isPast || temporalStatus.isLate) {
      toast.warning(
        "Este agendamento está atrasado ou já passou. Considere reagendar ou cancelar.",
      );
      return;
    }

    try {
      await handleRequest(endpoints.appointments.confirm(id));
      toast.success("Agendamento confirmado!");

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
      toast.error(`${message}`);
    }
  };

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
        "Este agendamento ainda não começou. Aguarde o horário para finalizar.",
      );
      return;
    }

    try {
      await handleRequest(endpoints.appointments.complete(id));
      toast.success("Atendimento finalizado!");

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
      toast.error(`${message}`);
    }
  };

  // ✅ Cancelar com confirmação
  const handleCancel = async (id: number) => {
    try {
      await handleRequest(
        endpoints.appointments.cancel(id, "Cancelado pelo barbeiro"),
      );
      toast.info("Agendamento cancelado!");

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
      toast.error(`${message}`);
    }
  };

  const getAvailableActions = (appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
    );

    const actions = [];

    if (
      appointment.status === "pending" &&
      !temporalStatus.isPast &&
      !temporalStatus.isLate
    ) {
      actions.push({
        key: "confirm",
        label: "Confirmar",
        icon: <CheckCircleIcon size={20} />,
        onClick: () => handleConfirm(appointment.id, appointment),
        className: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
        size: "w-9 h-9",
      });
    }

    if (
      appointment.status === "confirmed" &&
      (temporalStatus.isPast ||
        temporalStatus.isLate ||
        temporalStatus.label.includes("Em andamento"))
    ) {
      actions.push({
        key: "complete",
        label: "Finalizar",
        icon: <CheckCircleIcon size={20} />,
        onClick: () => handleComplete(appointment.id, appointment),
        className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
        size: "w-9 h-9",
      });
    }

    if (
      appointment.status === "pending" ||
      appointment.status === "confirmed" ||
      canRescheduleAppointment(temporalStatus)
    ) {
      actions.push({
        key: "reschedule",
        label: "Reagendar",
        icon: <CalendarPlusIcon size={20} />,
        onClick: () => openRescheduleModal(appointment),
        className: "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
        size: "w-9 h-9",
      });
    }

    // ✅ Cancelar com confirmação
    actions.push({
      key: "cancel",
      label: "Cancelar",
      icon: <XCircleIcon size={20} />,
      onClick: () => {}, // O ConfirmPopup cuida da ação
      className: "bg-red-500/20 text-red-500 hover:bg-red-500/30",
      size: "w-9 h-9",
      isConfirm: true,
      confirmTitle: "Cancelar Agendamento",
      confirmMessage: `Tem certeza que deseja cancelar o agendamento de ${appointment.client?.name || "cliente"}?`,
      onConfirm: () => handleCancel(appointment.id),
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

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

  useEffect(() => {
    document.title = "Dashboard | Barbearia";
  }, []);

  if (loading || loadingStats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <>
      {/* ✅ Header com saudação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="font-serif text-xl font-bold text-text">
            Olá, {user?.name?.split(" ")[0] || "Barbeiro"} 👋
          </h1>
          <p className="text-text-muted text-xs">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<ListIcon size={16} />}
          onClick={() => (window.location.href = "/agendamentos")}
        >
          Ver todos
        </Button>
      </div>

      {/* ✅ Cards de Estatísticas */}
      <section className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-primary-light rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-bold text-text">{stats?.total || 0}</p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <CalendarIcon size={16} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Pendentes
              </p>
              <p className="text-lg font-bold text-yellow-500">
                {stats?.pending || 0}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <ClockCounterClockwiseIcon
                size={16}
                className="text-yellow-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Confirmados
              </p>
              <p className="text-lg font-bold text-green-500">
                {stats?.confirmed || 0}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircleIcon size={16} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Receita
              </p>
              <p className="text-sm font-bold text-accent">
                {formatPrice(Number(stats?.total_revenue) || 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <MoneyIcon size={16} className="text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ✅ Agendamentos de Hoje */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif text-sm font-bold text-text">📅 Hoje</h2>
            <span className="text-text-muted text-xs">
              {sortedTodayAppointments.length}
            </span>
          </div>

          {sortedTodayAppointments.length === 0 ? (
            <div className="bg-primary-light rounded-xl text-center py-8 border border-border/50">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-text text-sm font-semibold">
                Nenhum agendamento hoje
              </p>
              <p className="text-text-muted text-xs mt-1">
                {stats?.pending && stats.pending > 0
                  ? `${stats.pending} pendente(s) para outros dias`
                  : "Organize sua agenda"}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Link
                  to="/agendamentos"
                  className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                >
                  Ver todos
                </Link>
                <Link
                  to="/servicos-admin"
                  className="btn-secondary text-xs py-1.5 px-3 rounded-lg"
                >
                  Adicionar serviço
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTodayAppointments.map((appointment) => {
                const status = getStatusBadge(appointment.status);
                const temporalStatus = getTemporalStatus(
                  appointment.appointment_date,
                  appointment.appointment_time,
                );
                const actions = getAvailableActions(appointment);

                return (
                  <div
                    key={appointment.id}
                    className={`bg-primary-light rounded-xl p-3 border transition-all hover:border-accent/20 ${
                      temporalStatus.isLate || temporalStatus.isPast
                        ? "border-red-500/30 bg-red-500/5"
                        : temporalStatus.label.includes("Começa em")
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border/50"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserIcon size={14} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text text-sm truncate">
                            {appointment.client?.name || "Cliente"}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                            <span className="flex items-center gap-0.5">
                              <ClockIcon size={10} />
                              {appointment.appointment_time}
                            </span>
                            <span className="w-0.5 h-0.5 bg-text-muted rounded-full"></span>
                            <span className="flex items-center gap-0.5">
                              {appointment.service?.category ? (
                                <ServiceIcon
                                  category={appointment.service.category}
                                  size={10}
                                />
                              ) : (
                                "✂️"
                              )}
                              {appointment.service?.name || "Serviço"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium border ${temporalStatus.className}`}
                        >
                          {temporalStatus.label}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <div className="flex gap-1 ml-auto">
                          {actions.map((action) => {
                            if (action.isConfirm) {
                              return (
                                <ConfirmPopup
                                  key={action.key}
                                  trigger={
                                    <button
                                      className={`rounded-lg transition ${action.className} ${action.size} flex items-center justify-center`}
                                      title={action.label}
                                    >
                                      {action.icon}
                                    </button>
                                  }
                                  onConfirm={action.onConfirm}
                                  title={action.confirmTitle || "Confirmar"}
                                  message={action.confirmMessage || ""}
                                  confirmText="Confirmar"
                                  cancelText="Cancelar"
                                  variant="danger"
                                  size="sm"
                                />
                              );
                            }
                            return (
                              <button
                                key={action.key}
                                onClick={action.onClick}
                                className={`rounded-lg transition ${action.className} ${action.size} flex items-center justify-center`}
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ✅ Sidebar */}
        <aside className="space-y-4">
          {/* ✅ Próximos Agendamentos */}
          <section>
            <h2 className="font-serif text-sm font-bold text-text mb-3">
              📌 Próximos
            </h2>
            {sortedUpcomingAppointments.length === 0 ? (
              <div className="bg-primary-light rounded-xl text-center py-6 border border-border/50">
                <div className="text-2xl mb-1">📅</div>
                <p className="text-text-muted text-xs">Nenhum futuro</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedUpcomingAppointments.map((app) => {
                  const temporalStatus = getTemporalStatus(
                    app.appointment_date,
                    app.appointment_time,
                  );
                  const actions = getAvailableActions(app);

                  return (
                    <div
                      key={app.id}
                      className={`bg-primary-light rounded-xl p-2.5 border transition-all hover:border-accent/20 ${
                        temporalStatus.isLate || temporalStatus.isPast
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-text text-xs truncate">
                            {app.client?.name || "Cliente"}
                          </p>
                          <p className="text-text-muted text-[10px]">
                            {formatDate(app.appointment_date)} •{" "}
                            {app.appointment_time}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium border ${temporalStatus.className}`}
                          >
                            {temporalStatus.label}
                          </span>
                          <span className="badge-gold text-[8px] px-1.5 py-0.5">
                            {app.service?.name || "Serviço"}
                          </span>
                          <div className="flex gap-1">
                            {actions.slice(0, 2).map((action) => {
                              if (action.isConfirm) {
                                return (
                                  <ConfirmPopup
                                    key={action.key}
                                    trigger={
                                      <button
                                        className={`rounded-lg transition ${action.className} ${action.size} flex items-center justify-center`}
                                        title={action.label}
                                      >
                                        {action.icon}
                                      </button>
                                    }
                                    onConfirm={action.onConfirm}
                                    title={action.confirmTitle || "Confirmar"}
                                    message={action.confirmMessage || ""}
                                    confirmText="Confirmar"
                                    cancelText="Cancelar"
                                    variant="danger"
                                    size="sm"
                                  />
                                );
                              }
                              return (
                                <button
                                  key={action.key}
                                  onClick={action.onClick}
                                  className={`rounded-lg transition ${action.className} ${action.size} flex items-center justify-center`}
                                  title={action.label}
                                >
                                  {action.icon}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ✅ Ações Rápidas */}
          <section>
            <h2 className="font-serif text-sm font-bold text-text mb-3">
              ⚡ Ações
            </h2>
            <nav className="space-y-1.5">
              {[
                { to: "/agendamentos", label: "Agendamentos", icon: ListIcon },
                { to: "/clientes", label: "Clientes", icon: UserIcon },
                {
                  to: "/servicos-admin",
                  label: "Serviços",
                  icon: ScissorsIcon,
                },
                { to: "/agenda", label: "Agenda", icon: CalendarIcon },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="bg-primary-light rounded-xl flex items-center justify-between p-2.5 border border-border/50 hover:border-accent/20 transition-all"
                >
                  <span className="text-text text-xs flex items-center gap-2">
                    <item.icon size={14} className="text-accent" />
                    {item.label}
                  </span>
                  <ArrowRightIcon size={14} className="text-accent" />
                </Link>
              ))}
            </nav>
          </section>
        </aside>
      </div>

      {/* ✅ Modal de Reagendamento */}
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
    </>
  );
};

export default Dashboard;
