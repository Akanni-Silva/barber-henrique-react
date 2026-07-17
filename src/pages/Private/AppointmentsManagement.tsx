// src/pages/Private/AppointmentsManagement.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  XIcon,
  EyeIcon,
  CalendarPlusIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CaretCircleUpIcon,
  CaretCircleDownIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { RescheduleModal } from "../../components/Common/RescheduleModal";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import {
  getTemporalStatus,
  canRescheduleAppointment,
  canConfirmAppointment,
  canCompleteAppointment,
  canCancelAppointment,
} from "../../utils/appointmentStatus";
import type {
  Appointment,
  AppointmentFilters,
  Product,
  ActionItem,
} from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";
import { useFilter } from "../../contexts/FilterContext";

export const AppointmentsManagement = () => {
  const { loading, handleRequest, endpoints } = useApi();
  const { showFilters, toggleFilters, closeFilters } = useFilter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Product[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // ✅ Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const requestParams = useMemo(() => {
    const params: any = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return params;
  }, [page, limit, filters.status, filters.startDate, filters.endDate]);

  const sortAppointmentsByDate = useCallback((list: Appointment[]) => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a.appointment_date);
      const dateB = new Date(b.appointment_date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.appointment_time.localeCompare(a.appointment_time);
    });
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!searchTerm.trim()) return appointments;
    const term = searchTerm.toLowerCase().trim();
    return appointments.filter(
      (app) =>
        app.client?.name?.toLowerCase().includes(term) ||
        app.client?.phone?.includes(term) ||
        app.service?.name?.toLowerCase().includes(term),
    );
  }, [appointments, searchTerm]);

  const fetchAppointments = useCallback(async () => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    setIsLoading(true);
    try {
      const data = await handleRequest(
        endpoints.appointments.findAll(requestParams),
      );
      const sortedAppointments = sortAppointmentsByDate(
        data?.appointments || [],
      );
      setAppointments(sortedAppointments);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [
    handleRequest,
    endpoints.appointments,
    requestParams,
    sortAppointmentsByDate,
  ]);

  const fetchServices = useCallback(async () => {
    setIsServicesLoading(true);
    try {
      let data = await handleRequest(endpoints.products.findActive());
      if (!data || (Array.isArray(data) && data.length === 0)) {
        data = await handleRequest(endpoints.products.findAll());
      }
      setServices(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Serviços não disponíveis para reagendamento:", error);
      }
      setServices([]);
    } finally {
      setIsServicesLoading(false);
    }
  }, [handleRequest, endpoints.products]);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

  useEffect(() => {
    if (isMounted.current) {
      fetchAppointments();
      fetchServices();
      isMounted.current = false;
    }
  }, [fetchAppointments, fetchServices]);

  useEffect(() => {
    if (!isMounted.current) {
      fetchAppointments();
    }
  }, [fetchAppointments]);

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setPage(1);
    closeFilters();
    setSearchTerm("");
  };

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
      toast.success("Agendamento reagendado com sucesso!");
      await fetchAppointments();
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
      appointment.status,
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
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao confirmar agendamento";
      toast.error(`${message}`);
    }
  };

  const handleComplete = async (id: number, appointment: Appointment) => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
      appointment.status,
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
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao finalizar atendimento";
      toast.error(`${message}`);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await handleRequest(
        endpoints.appointments.cancel(id, "Cancelado pelo barbeiro"),
      );
      toast.info("Agendamento cancelado!");
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao cancelar agendamento";
      toast.error(`${message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendente",
        className: "badge-gold",
      },
      confirmed: {
        label: "Confirmado",
        className:
          "bg-green-500/10 text-green-500 border-green-500/30 px-2 py-1 rounded-full text-xs font-medium border",
      },
      completed: {
        label: "Concluído",
        className:
          "bg-blue-500/10 text-blue-500 border-blue-500/30 px-2 py-1 rounded-full text-xs font-medium border",
      },
      cancelled: {
        label: "Cancelado",
        className:
          "bg-red-500/10 text-red-500 border-red-500/30 px-2 py-1 rounded-full text-xs font-medium border",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getAvailableActions = (appointment: Appointment): ActionItem[] => {
    const temporalStatus = getTemporalStatus(
      appointment.appointment_date,
      appointment.appointment_time,
      appointment.status,
    );

    const actions: ActionItem[] = [];

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return actions;
    }

    if (
      appointment.status === "pending" &&
      canConfirmAppointment(temporalStatus, appointment.status)
    ) {
      actions.push({
        key: "confirm",
        label: "Confirmar",
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleConfirm(appointment.id, appointment),
        className: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
        size: "w-9 h-9",
      });
    }

    if (
      appointment.status === "confirmed" &&
      canCompleteAppointment(temporalStatus, appointment.status)
    ) {
      actions.push({
        key: "complete",
        label: "Finalizar",
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleComplete(appointment.id, appointment),
        className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
        size: "w-9 h-9",
      });
    }

    if (canRescheduleAppointment(temporalStatus, appointment.status)) {
      actions.push({
        key: "reschedule",
        label: "Reagendar",
        icon: <CalendarPlusIcon size={16} />,
        onClick: () => openRescheduleModal(appointment),
        className: "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
        size: "w-9 h-9",
      });
    }

    if (canCancelAppointment(appointment.status)) {
      actions.push({
        key: "cancel",
        label: "Cancelar",
        icon: <XCircleIcon size={16} />,
        onClick: () => {},
        className: "bg-red-500/20 text-red-500 hover:bg-red-500/30",
        size: "w-9 h-9",
        isConfirm: true,
        confirmTitle: "Cancelar Agendamento",
        confirmMessage: `Tem certeza que deseja cancelar o agendamento de ${appointment.client?.name || "cliente"}?`,
        onConfirm: () => handleCancel(appointment.id),
      });
    }

    return actions;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando agendamentos..." />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ✅ Header com Navegação e Estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-text">
              Agendamentos
            </h1>
            <p className="text-text-muted text-xs md:text-sm">
              {total} agendamento(s) encontrado(s)
            </p>
          </div>
        </div>
        {isDesktop && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-text-muted text-xs bg-primary-light/50 px-3 py-1.5 rounded-lg border border-border/50">
              <span className="font-medium">Total:</span>
              <span className="text-text font-bold">{total}</span>
            </div>
            <Link
              to="/agendar"
              className="btn-primary text-sm px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
            >
              <PlusIcon size={16} />
              Novo Agendamento
            </Link>
          </div>
        )}
      </div>

      {/* ✅ Barra de busca e filtros - Adaptativa */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 md:py-3 bg-primary-light border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleFilters}
            className={`flex-1 md:flex-none px-3 py-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 text-sm min-h-[44px] ${
              showFilters
                ? "border-accent bg-accent/10 text-accent"
                : "border-border/50 text-text-muted hover:border-accent/30"
            }`}
          >
            <FunnelIcon size={16} />
            <span>Filtros</span>
            {showFilters ? (
              <CaretCircleUpIcon size={14} />
            ) : (
              <CaretCircleDownIcon size={14} />
            )}
          </button>

          {(filters.status ||
            filters.startDate ||
            filters.endDate ||
            searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 rounded-xl border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition flex items-center gap-1 text-sm min-h-[44px]"
            >
              <XIcon size={16} />
              <span className="hidden xs:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* ✅ Filtros expandíveis */}
      {showFilters && (
        <div className="bg-primary-light rounded-xl p-3 md:p-4 mb-4 border border-border/50 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 bg-primary border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-accent transition"
            >
              Limpar todos os filtros
            </button>
          </div>
        </div>
      )}

      {/* ✅ Lista de Agendamentos - Cards Adaptativos */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-serif text-lg font-bold text-text mb-2">
            Nenhum agendamento
          </h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            {filters.status ||
            filters.startDate ||
            filters.endDate ||
            searchTerm
              ? "Ajuste os filtros ou a busca"
              : "Ainda não há agendamentos realizados"}
          </p>
          {!isDesktop && (
            <Link
              to="/agendar"
              className="btn-primary text-sm px-4 py-2 rounded-xl inline-flex items-center gap-1.5 mt-4"
            >
              <PlusIcon size={16} />
              Novo Agendamento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 md:space-y-3">
          {filteredAppointments.map((appointment) => {
            const status = getStatusBadge(appointment.status);
            const temporalStatus = getTemporalStatus(
              appointment.appointment_date,
              appointment.appointment_time,
              appointment.status,
            );
            const actions: ActionItem[] = getAvailableActions(appointment);

            return (
              <div
                key={appointment.id}
                className={`bg-primary-light rounded-xl p-3 md:p-4 border transition-all hover:border-accent/20 ${
                  temporalStatus.isLate
                    ? "border-red-500/30 bg-red-500/5"
                    : temporalStatus.label.includes("Começa em")
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border/50"
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Cliente e Serviço */}
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserIcon
                        size={isDesktop ? 18 : 14}
                        className="text-accent"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text text-sm md:text-base truncate">
                        {appointment.client?.name || "Cliente"}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm text-text-muted">
                        <span className="flex items-center gap-0.5">
                          <ClockIcon size={isDesktop ? 14 : 10} />
                          {appointment.appointment_time}
                        </span>
                        <span className="w-0.5 h-0.5 bg-text-muted rounded-full" />
                        <span className="flex items-center gap-0.5 truncate">
                          {appointment.service?.category ? (
                            <ServiceIcon
                              category={appointment.service.category}
                              size={isDesktop ? 14 : 10}
                            />
                          ) : (
                            "✂️"
                          )}
                          {appointment.service?.name || "Serviço"}
                        </span>
                        {isDesktop && (
                          <>
                            <span className="w-0.5 h-0.5 bg-text-muted rounded-full" />
                            <span className="text-text-muted">
                              {formatDate(appointment.appointment_date)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data e Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {!isDesktop && (
                      <span className="text-text-muted text-xs">
                        {formatDate(appointment.appointment_date)}
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                      <span
                        className={`px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-xs font-medium border ${temporalStatus.className}`}
                      >
                        {temporalStatus.label}
                      </span>
                      <span
                        className={`px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {isDesktop && appointment.service?.price && (
                        <span className="text-accent text-xs font-medium">
                          {formatPrice(Number(appointment.service.price))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/30">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetails(true);
                      }}
                      className="p-1.5 md:p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center gap-1 text-xs"
                    >
                      <EyeIcon size={isDesktop ? 16 : 14} />
                      <span className="hidden xs:inline">Detalhes</span>
                    </button>

                    {actions.map((action) => {
                      if (action.isConfirm) {
                        return (
                          <ConfirmPopup
                            key={action.key}
                            trigger={
                              <button
                                className={`p-1.5 md:p-2 rounded-lg transition ${action.className} flex items-center gap-1 text-xs`}
                              >
                                {action.icon}
                                <span className="hidden xs:inline">
                                  {action.label}
                                </span>
                              </button>
                            }
                            onConfirm={action.onConfirm!}
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
                          className={`p-1.5 md:p-2 rounded-lg transition ${action.className} flex items-center gap-1 text-xs`}
                        >
                          {action.icon}
                          <span className="hidden xs:inline">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Paginação */}
      {total > limit && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-border/50 mt-4">
          <p className="text-text-muted text-xs md:text-sm">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
            de {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border/50 rounded-xl text-text-muted hover:text-text hover:border-accent/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium min-w-[40px] text-center">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 border border-border/50 rounded-xl text-text-muted hover:text-text hover:border-accent/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* ✅ Modal de Detalhes */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10">
              <h3 className="font-serif text-lg font-bold text-text">
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Cliente */}
              <div className="flex items-center gap-3 p-3 bg-primary/50 rounded-xl">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <UserIcon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-text">
                    {selectedAppointment.client?.name || "Cliente"}
                  </p>
                  <p className="text-text-muted text-sm">
                    {selectedAppointment.client?.phone || ""}
                  </p>
                </div>
              </div>

              {/* Serviço */}
              <div className="p-3 bg-primary/50 rounded-xl space-y-1">
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                  Serviço
                </p>
                <div className="flex items-center gap-2">
                  {selectedAppointment.service?.category ? (
                    <ServiceIcon
                      category={selectedAppointment.service.category}
                      size={20}
                      className="text-accent"
                    />
                  ) : (
                    <span className="text-xl">✂️</span>
                  )}
                  <p className="text-text font-medium">
                    {selectedAppointment.service?.name || "Serviço"}
                  </p>
                </div>
                <p className="text-text-muted text-sm">
                  {formatPrice(Number(selectedAppointment.service?.price) || 0)}{" "}
                  • {selectedAppointment.service?.duration_minutes || 0} min
                </p>
              </div>

              {/* Data e Hora */}
              <div className="p-3 bg-primary/50 rounded-xl space-y-1">
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                  Data e Hora
                </p>
                <p className="text-text font-medium">
                  {formatDate(selectedAppointment.appointment_date)}
                </p>
                <p className="text-text-muted text-sm flex items-center gap-1">
                  <ClockIcon size={14} /> {selectedAppointment.appointment_time}
                </p>
              </div>

              {/* Status */}
              <div className="p-3 bg-primary/50 rounded-xl space-y-1">
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={
                      getStatusBadge(selectedAppointment.status).className
                    }
                  >
                    {getStatusBadge(selectedAppointment.status).label}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      getTemporalStatus(
                        selectedAppointment.appointment_date,
                        selectedAppointment.appointment_time,
                        selectedAppointment.status,
                      ).className
                    }`}
                  >
                    {
                      getTemporalStatus(
                        selectedAppointment.appointment_date,
                        selectedAppointment.appointment_time,
                        selectedAppointment.status,
                      ).label
                    }
                  </span>
                </div>
              </div>

              {/* Observações */}
              {selectedAppointment.notes && (
                <div className="p-3 bg-primary/50 rounded-xl space-y-1">
                  <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                    Observações
                  </p>
                  <p className="text-text text-sm">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-2">
                {getAvailableActions(selectedAppointment).map((action) => {
                  if (action.isConfirm) {
                    return (
                      <ConfirmPopup
                        key={action.key}
                        trigger={
                          <Button variant="danger" size="sm" icon={action.icon}>
                            {action.label}
                          </Button>
                        }
                        onConfirm={action.onConfirm!}
                        title={action.confirmTitle || "Confirmar"}
                        message={action.confirmMessage || ""}
                        confirmText="Confirmar"
                        cancelText="Voltar"
                        variant="danger"
                        size="sm"
                      />
                    );
                  }
                  return (
                    <Button
                      key={action.key}
                      variant="primary"
                      size="sm"
                      icon={action.icon}
                      onClick={() => {
                        action.onClick();
                        if (action.key !== "reschedule") {
                          setShowDetails(false);
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        isLoading={isServicesLoading}
      />
    </div>
  );
};

export default AppointmentsManagement;
