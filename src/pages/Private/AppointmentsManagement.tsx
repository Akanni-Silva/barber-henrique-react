/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
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
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import type { Appointment, AppointmentFilters } from "../../types";

export const AppointmentsManagement = () => {
  const { loading, endpoints } = useApi();

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

  // ✅ Buscar agendamentos - função estável
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await endpoints.appointments.findAll({
        ...filters,
        page,
        limit,
      });
      setAppointments(data?.appointments || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]); // ✅ Dependências específicas

  // ✅ useEffect com dependências corretas
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // ✅ Dependência estável

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

  // ✅ Confirmar agendamento
  const handleConfirm = async (id: number) => {
    try {
      await endpoints.appointments.confirm(id);
      toast.success("✅ Agendamento confirmado!");
      await fetchAppointments();
    } catch (error: any) {
      console.error("Erro ao confirmar:", error);
      const message =
        error.response?.data?.message || "Erro ao confirmar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Finalizar agendamento
  const handleComplete = async (id: number) => {
    try {
      await endpoints.appointments.complete(id);
      toast.success("✅ Atendimento finalizado!");
      await fetchAppointments();
    } catch (error: any) {
      console.error("Erro ao finalizar:", error);
      const message =
        error.response?.data?.message || "Erro ao finalizar atendimento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Cancelar agendamento
  const handleCancel = async (id: number) => {
    try {
      await endpoints.appointments.cancel(id, "Cancelado pelo barbeiro");
      toast.info("❌ Agendamento cancelado!");
      await fetchAppointments();
    } catch (error: any) {
      console.error("Erro ao cancelar:", error);
      const message =
        error.response?.data?.message || "Erro ao cancelar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  // ✅ Deletar agendamento
  const handleDelete = async (id: number) => {
    try {
      await endpoints.appointments.delete(id);
      toast.success("🗑️ Agendamento removido!");
      await fetchAppointments();
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      const message =
        error.response?.data?.message || "Erro ao deletar agendamento";
      toast.error(`❌ ${message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", className: "badge-gold" },
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
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getStatusActions = (appointment: Appointment) => {
    switch (appointment.status) {
      case "pending":
        return (
          <div className="flex gap-1">
            <button
              onClick={() => handleConfirm(appointment.id)}
              className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition"
              title="Confirmar"
            >
              <CheckCircleIcon size={16} />
            </button>
            <button
              onClick={() => handleCancel(appointment.id)}
              className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
              title="Cancelar"
            >
              <XCircleIcon size={16} />
            </button>
          </div>
        );
      case "confirmed":
        return (
          <div className="flex gap-1">
            <button
              onClick={() => handleComplete(appointment.id)}
              className="p-1.5 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition"
              title="Finalizar"
            >
              <CheckCircleIcon size={16} />
            </button>
            <button
              onClick={() => handleCancel(appointment.id)}
              className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
              title="Cancelar"
            >
              <XCircleIcon size={16} />
            </button>
          </div>
        );
      case "completed":
      case "cancelled":
        return (
          <ConfirmPopup
            trigger={
              <button
                className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                title="Excluir"
              >
                <XCircleIcon size={16} />
              </button>
            }
            onConfirm={() => handleDelete(appointment.id)}
            title="Excluir Agendamento"
            message="Tem certeza que deseja excluir este agendamento?"
            confirmText="Excluir"
            cancelText="Cancelar"
            variant="danger"
          />
        );
      default:
        return null;
    }
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
                <th className="text-right py-3 px-3 text-text-muted text-sm font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const status = getStatusBadge(appointment.status);
                return (
                  <tr
                    key={appointment.id}
                    className="border-b border-border/50 hover:bg-primary-light/50 transition"
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
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
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
                        {getStatusActions(appointment)}
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
                  {formatPrice(selectedAppointment.service?.price || 0)} •{" "}
                  {selectedAppointment.service?.duration_minutes || 0} min
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

              {selectedAppointment.notes && (
                <div>
                  <p className="text-text-muted text-sm">Observações</p>
                  <p className="text-text text-sm bg-primary p-2 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {selectedAppointment.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirm(selectedAppointment.id);
                        setShowDetails(false);
                      }}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedAppointment.id);
                        setShowDetails(false);
                      }}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <button
                    onClick={() => {
                      handleComplete(selectedAppointment.id);
                      setShowDetails(false);
                    }}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Finalizar
                  </button>
                )}
                {(selectedAppointment.status === "completed" ||
                  selectedAppointment.status === "cancelled") && (
                  <button
                    onClick={() => {
                      handleDelete(selectedAppointment.id);
                      setShowDetails(false);
                    }}
                    className="btn-secondary text-sm py-2 px-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Excluir
                  </button>
                )}
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
    </div>
  );
};
