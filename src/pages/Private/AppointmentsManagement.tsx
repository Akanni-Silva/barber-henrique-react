/* eslint-disable react-hooks/refs */
// src/pages/Private/AppointmentsManagement.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import {
  ClockIcon,
  UserIcon,
  ScissorsIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  XIcon,
  EyeIcon,
  CalendarPlusIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { RescheduleModal } from "../../components/Common/RescheduleModal";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import {
  getTemporalStatus,
  canRescheduleAppointment,
} from "../../utils/appointmentStatus";
import type { Appointment, AppointmentFilters, Product } from "../../types";

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

  // Estado para o modal de reagendamento
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  // ✅ Ref para evitar chamadas duplicadas
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // ✅ Memoizar parâmetros da requisição para evitar recriação
  const requestParams = useMemo(() => {
    const params: any = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return params;
  }, [page, limit, filters.status, filters.startDate, filters.endDate]);

  // ✅ Função para ordenar agendamentos (mais recentes primeiro) - ESTÁVEL
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

  // ✅ Buscar agendamentos usando handleRequest - SEM isLoading nas dependências
  const fetchAppointments = useCallback(async () => {
    // Evitar chamadas concorrentes
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
    // ✅ REMOVIDO: isLoading - não pode ser dependência
  ]);

  // ✅ Buscar serviços com fallback silencioso - ESTÁVEL
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

  // ✅ useEffect para carregar dados iniciais - UMA VEZ
  useEffect(() => {
    if (isMounted.current) {
      fetchAppointments();
      fetchServices();
      isMounted.current = false;
    }
  }, [fetchAppointments, fetchServices]);

  // ✅ useEffect para recarregar quando página ou filtros mudarem
  useEffect(() => {
    // Só recarregar se não for a primeira montagem
    if (!isMounted.current) {
      fetchAppointments();
    }
  }, [fetchAppointments]);

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
    setShowFilters(false);
  };

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
      await fetchAppointments();
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

  // ✅ Confirmar agendamento
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
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao confirmar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Finalizar agendamento
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
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao finalizar atendimento";
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
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao cancelar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Deletar agendamento
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (id: number) => {
    try {
      await handleRequest(endpoints.appointments.delete(id));
      toast.success("🗑️ Agendamento removido!");
      await fetchAppointments();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao deletar agendamento";
      toast.error(`❌ ${message}`);
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

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">
          Carregando agendamentos...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Gerenciar Agendamentos
          </h1>
          <p className="text-text-muted text-sm">
            {total} agendamentos encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4"
          >
            <FunnelIcon size={18} />
            Filtros
          </button>
          {(filters.status || filters.startDate || filters.endDate) && (
            <button
              onClick={clearFilters}
              className="p-2 text-text-muted hover:text-accent transition border border-border rounded-lg hover:border-accent/50"
              title="Limpar filtros"
            >
              <XIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="card-primary p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="input-primary"
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
                className="input-primary"
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
                className="input-primary"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-text-muted hover:text-accent transition text-sm"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-text-muted">
            {filters.status || filters.startDate || filters.endDate
              ? "Tente ajustar os filtros"
              : "Ainda não há agendamentos realizados"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium">
                  Cliente
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden sm:table-cell">
                  Serviço
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium">
                  Data/Hora
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden lg:table-cell">
                  Temporal
                </th>
                <th className="text-right py-3 px-3 text-text-muted text-sm font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const status = getStatusBadge(appointment.status);
                const temporalStatus = getTemporalStatus(
                  appointment.appointment_date,
                  appointment.appointment_time,
                );
                const actions = getAvailableActions(appointment);

                return (
                  <tr
                    key={appointment.id}
                    className={`border-b border-border/50 hover:bg-primary-light/50 transition ${
                      temporalStatus.isLate
                        ? "bg-red-500/5"
                        : temporalStatus.label.includes("Começa em")
                          ? "bg-green-500/5"
                          : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <UserIcon size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-text font-medium text-sm">
                            {appointment.client?.name || "Cliente"}
                          </p>
                          <p className="text-text-muted text-xs">
                            {appointment.client?.phone || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <ScissorsIcon size={16} className="text-text-muted" />
                        <span className="text-text text-sm">
                          {appointment.service?.name || "Serviço"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-text text-sm">
                          {formatDate(appointment.appointment_date)}
                        </span>
                        <span className="text-text-muted text-xs flex items-center gap-1">
                          <ClockIcon size={12} />
                          {appointment.appointment_time}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className={status.className}>{status.label}</span>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${temporalStatus.className}`}
                      >
                        {temporalStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetails(true);
                          }}
                          className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                          title="Ver detalhes"
                        >
                          <EyeIcon size={16} />
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {total > limit && (
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-text-muted text-sm">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
            de {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded-lg text-text-muted hover:text-text hover:border-accent/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 border border-border rounded-lg text-text-muted hover:text-text hover:border-accent/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-text-muted hover:text-text transition"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-text-muted text-sm">Cliente</p>
                <p className="text-text font-medium">
                  {selectedAppointment.client?.name || "Cliente"}
                </p>
                <p className="text-text-muted text-sm">
                  {selectedAppointment.client?.phone || ""}
                </p>
              </div>

              <div>
                <p className="text-text-muted text-sm">Serviço</p>
                <p className="text-text font-medium">
                  {selectedAppointment.service?.name || "Serviço"}
                </p>
                <p className="text-text-muted text-sm">
                  {formatPrice(Number(selectedAppointment.service?.price) || 0)}{" "}
                  • {selectedAppointment.service?.duration_minutes || 0} min
                </p>
              </div>

              <div>
                <p className="text-text-muted text-sm">Data e Hora</p>
                <p className="text-text font-medium">
                  {formatDate(selectedAppointment.appointment_date)}
                </p>
                <p className="text-text-muted text-sm">
                  {selectedAppointment.appointment_time}
                </p>
              </div>

              <div>
                <p className="text-text-muted text-sm">Status</p>
                <span
                  className={
                    getStatusBadge(selectedAppointment.status).className
                  }
                >
                  {getStatusBadge(selectedAppointment.status).label}
                </span>
              </div>

              {/* Status temporal */}
              <div>
                <p className="text-text-muted text-sm">Status do Horário</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border inline-block mt-1 ${
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

              {selectedAppointment.notes && (
                <div>
                  <p className="text-text-muted text-sm">Observações</p>
                  <p className="text-text text-sm bg-primary p-2 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {getAvailableActions(selectedAppointment).map((action) => (
                  <button
                    key={action.key}
                    onClick={() => {
                      action.onClick();
                      if (action.key !== "reschedule") {
                        setShowDetails(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${action.className}`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-text-muted hover:text-text transition text-sm"
                >
                  Fechar
                </button>
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
