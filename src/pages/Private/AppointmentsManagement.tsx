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
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { RescheduleModal } from "../../components/Common/RescheduleModal";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import {
  getTemporalStatus,
  canRescheduleAppointment,
} from "../../utils/appointmentStatus";
import type { Appointment, AppointmentFilters, Product } from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

export const AppointmentsManagement = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Product[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

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
    setShowFilters(false);
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

  const handleDelete = async (id: number) => {
    try {
      await handleRequest(endpoints.appointments.delete(id));
      toast.success("Agendamento removido!");
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao deletar agendamento";
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
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleConfirm(appointment.id, appointment),
        className: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
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
        icon: <CheckCircleIcon size={16} />,
        onClick: () => handleComplete(appointment.id, appointment),
        className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
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
        icon: <CalendarPlusIcon size={16} />,
        onClick: () => openRescheduleModal(appointment),
        className: "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
      });
    }

    actions.push({
      key: "cancel",
      label: "Cancelar",
      icon: <XCircleIcon size={16} />,
      onClick: () => handleCancel(appointment.id),
      className: "bg-red-500/20 text-red-500 hover:bg-red-500/30",
    });

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
    <>
      {/* ✅ Header com navegação */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
        >
          <ArrowLeftIcon size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            📋 Agendamentos
          </h1>
          <p className="text-text-muted text-sm">
            {total} agendamentos encontrados
          </p>
        </div>
      </div>

      {/* ✅ Barra de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-primary-light border border-border/50 rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition flex items-center gap-2 ${
              showFilters
                ? "border-accent bg-accent/10 text-accent"
                : "border-border/50 text-text-muted hover:border-accent/30"
            }`}
          >
            <FunnelIcon size={18} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          {(filters.status ||
            filters.startDate ||
            filters.endDate ||
            searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition"
            >
              <XIcon size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Filtros expandíveis */}
      {showFilters && (
        <div className="bg-primary-light rounded-2xl p-4 mb-6 border border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-3 bg-primary border border-border/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-4 py-3 bg-primary border border-border/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-4 py-3 bg-primary border border-border/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Lista de Agendamentos */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-text-muted">
            {filters.status ||
            filters.startDate ||
            filters.endDate ||
            searchTerm
              ? "Tente ajustar os filtros ou a busca"
              : "Ainda não há agendamentos realizados"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const status = getStatusBadge(appointment.status);
            const temporalStatus = getTemporalStatus(
              appointment.appointment_date,
              appointment.appointment_time,
            );
            const actions = getAvailableActions(appointment);

            return (
              <div
                key={appointment.id}
                className={`bg-primary-light rounded-2xl p-4 border transition-all hover:border-accent/20 ${
                  temporalStatus.isLate
                    ? "border-red-500/30 bg-red-500/5"
                    : temporalStatus.label.includes("Começa em")
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Cliente */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon size={18} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text truncate">
                        {appointment.client?.name || "Cliente"}
                      </p>
                      <p className="text-text-muted text-xs truncate">
                        {appointment.client?.phone || ""}
                      </p>
                    </div>
                  </div>

                  {/* Serviço */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appointment.service?.category ? (
                      <ServiceIcon
                        category={appointment.service.category}
                        size={16}
                        className="text-text-muted"
                      />
                    ) : (
                      <span className="text-xs">✂️</span>
                    )}
                    <span className="text-text text-sm truncate max-w-[120px]">
                      {appointment.service?.name || "Serviço"}
                    </span>
                  </div>

                  {/* Data/Hora */}
                  <div className="flex items-center gap-3 text-sm flex-shrink-0">
                    <span className="text-text whitespace-nowrap">
                      {formatDate(appointment.appointment_date)}
                    </span>
                    <span className="text-text-muted text-xs flex items-center gap-1 whitespace-nowrap">
                      <ClockIcon size={12} />
                      {appointment.appointment_time}
                    </span>
                  </div>

                  {/* Badges e Ações */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <span className={status.className}>{status.label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium border ${temporalStatus.className}`}
                    >
                      {temporalStatus.label}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetails(true);
                        }}
                        className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                        title="Ver detalhes"
                      >
                        <EyeIcon size={14} />
                      </button>
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
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Paginação */}
      {total > limit && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/50 mt-6">
          <p className="text-text-muted text-sm">
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
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium">
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
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10">
              <h3 className="font-serif text-lg font-bold text-text">
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-xl hover:bg-primary"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
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
                      ).className
                    }`}
                  >
                    {
                      getTemporalStatus(
                        selectedAppointment.appointment_date,
                        selectedAppointment.appointment_time,
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
                {getAvailableActions(selectedAppointment).map((action) => (
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
                ))}
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
    </>
  );
};

export default AppointmentsManagement;
