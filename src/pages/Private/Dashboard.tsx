/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Private/Dashboard.tsx
import { useState, useEffect, useCallback } from "react";
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
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Common/Spinner";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import type { Appointment, AppointmentStats } from "../../types";

export const Dashboard = () => {
  const { user } = useAuth();
  const { loading, endpoints } = useApi();

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const [todayData, statsData, upcomingData] = await Promise.all([
          endpoints.appointments.findToday(),
          endpoints.appointments.getStats(),
          endpoints.appointments.findUpcoming(5),
        ]);

        setTodayAppointments(todayData || []);
        setStats(statsData || null);
        setUpcomingAppointments(upcomingData || []);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Confirmar
  const handleConfirm = async (id: number) => {
    try {
      await endpoints.appointments.confirm(id);
      toast.success("✅ Agendamento confirmado!");
      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "confirmed" as const } : app,
        ),
      );
    } catch (error: any) {
      console.error("Erro ao confirmar:", error);
      toast.error("❌ Erro ao confirmar agendamento");
    }
  };

  // ✅ Finalizar
  const handleComplete = async (id: number) => {
    try {
      await endpoints.appointments.complete(id);
      toast.success("✅ Atendimento finalizado!");
      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "completed" as const } : app,
        ),
      );
    } catch (error: any) {
      console.error("Erro ao finalizar:", error);
      toast.error("❌ Erro ao finalizar atendimento");
    }
  };

  // ✅ Cancelar
  const handleCancel = async (id: number) => {
    try {
      await endpoints.appointments.cancel(id, "Cancelado pelo barbeiro");
      toast.info("❌ Agendamento cancelado!");
      setTodayAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "cancelled" as const } : app,
        ),
      );
    } catch (error: any) {
      console.error("Erro ao cancelar:", error);
      toast.error("❌ Erro ao cancelar agendamento");
    }
  };

  const getStatusBadge = useCallback((status: string) => {
    const statusMap = {
      pending: { label: "Pendente", className: "badge-gold" },
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
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        >
          <ListIcon size={20} />
          Ver todos
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total</p>
              <p className="text-2xl font-bold text-text">
                {stats?.total || 0}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
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
            <div className="p-2 bg-yellow-500/10 rounded-lg">
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
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircleIcon size={24} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="card-primary border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Receita</p>
              <p className="text-2xl font-bold text-accent">
                {formatPrice(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <MoneyIcon size={24} className="text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agendamentos de Hoje */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-text">
              📅 Agendamentos de Hoje
            </h2>
            <span className="text-text-muted text-sm">
              {todayAppointments.length} agendamentos
            </span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="card-primary text-center py-8">
              <div className="text-4xl mb-3">😎</div>
              <p className="text-text-muted">Nenhum agendamento para hoje</p>
              <p className="text-text-muted text-sm">
                Aproveite para organizar a agenda!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => {
                const status = getStatusBadge(appointment.status);
                return (
                  <div
                    key={appointment.id}
                    className="card-primary hover:border-accent/30 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <UserIcon size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-text">
                            {appointment.client?.name || "Cliente"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              {appointment.appointment_time}
                            </span>
                            <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <ScissorsIcon size={14} />
                              {appointment.service?.name || "Serviço"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>

                        {appointment.status === "pending" && (
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
                        )}

                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() => handleComplete(appointment.id)}
                            className="p-1.5 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition"
                            title="Finalizar"
                          >
                            <CheckCircleIcon size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Próximos Agendamentos */}
          <div>
            <h2 className="font-serif text-xl font-bold text-text mb-4">
              📌 Próximos
            </h2>
            {upcomingAppointments.length === 0 ? (
              <div className="card-primary text-center py-6">
                <p className="text-text-muted text-sm">
                  Nenhum agendamento futuro
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="card-primary p-3 hover:border-accent/30 transition"
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
                      <span className="badge-gold text-xs">
                        {app.service?.name || "Serviço"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div>
            <h2 className="font-serif text-xl font-bold text-text mb-4">
              ⚡ Ações Rápidas
            </h2>
            <div className="space-y-2">
              <Link
                to="/agendamentos"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Gerenciar Agendamentos</span>
                <ArrowRightIcon size={20} className="text-accent" />
              </Link>
              <Link
                to="/clientes"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Ver Clientes</span>
                <ArrowRightIcon size={20} className="text-accent" />
              </Link>
              <Link
                to="/servicos-admin"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Gerenciar Serviços</span>
                <ArrowRightIcon size={20} className="text-accent" />
              </Link>
              <Link
                to="/agenda"
                className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3"
              >
                <span className="text-text">Configurar Agenda</span>
                <ArrowRightIcon size={20} className="text-accent" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
