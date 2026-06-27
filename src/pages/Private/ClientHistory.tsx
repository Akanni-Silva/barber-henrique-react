/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/Private/ClientHistory.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  MoneyIcon,
  ScissorsIcon,
  TrendUpIcon,
  ClockCounterClockwiseIcon,
  ListIcon,
  CheckCircleIcon,
  XCircleIcon,
  HourglassIcon,
  CaretCircleRightIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import {
  calculateClientHistoryStats,
  groupAppointmentsByMonth,
  getMonthLabel,
  hasClientHistory,
} from "../../utils/clientHistory";
import type {
  Appointment,
  Client,
  StatusType,
  ClientHistoryStats,
} from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

export const ClientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, handleRequest, endpoints } = useApi();

  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // ✅ Ref para controlar se a requisição já foi feita
  const hasFetched = useRef(false);

  const clientId = Number(id);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

  // ✅ Função de busca com useCallback e controle de execução
  const fetchClientHistory = useCallback(async () => {
    // ✅ Evitar múltiplas requisições
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!clientId || isNaN(clientId)) {
      toast.error("Cliente inválido");
      navigate("/clientes");
      return;
    }

    setIsLoading(true);
    try {
      const [clientData, historyData] = await Promise.all([
        handleRequest(endpoints.clients.findById(clientId)),
        handleRequest(endpoints.clients.getHistory(clientId)),
      ]);

      setClient(clientData);
      // ✅ historyData já é o array de appointments
      setAppointments(Array.isArray(historyData) ? historyData : []);
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error);
      const message =
        error?.response?.data?.message || "Erro ao carregar histórico";
      toast.error(`❌ ${message}`);
      navigate("/clientes");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, navigate, handleRequest, endpoints.clients]);

  // ✅ useEffect com dependências corretas
  useEffect(() => {
    fetchClientHistory();
  }, [fetchClientHistory]);

  // ✅ stats com tipagem correta
  const stats: ClientHistoryStats = useMemo(() => {
    return calculateClientHistoryStats(appointments || []);
  }, [appointments]);

  // ✅ groupedAppointments com tipagem correta
  const groupedAppointments = useMemo(() => {
    return groupAppointmentsByMonth(appointments || []);
  }, [appointments]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allMonths = Object.keys(groupedAppointments);
    setExpandedMonths(new Set(allMonths));
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
  };

  const getStatusBadge = (status: StatusType) => {
    const statusMap: Record<
      StatusType,
      { label: string; className: string; icon: React.ReactNode }
    > = {
      pending: {
        label: "Pendente",
        className: "badge-gold",
        icon: <HourglassIcon size={12} />,
      },
      confirmed: {
        label: "Confirmado",
        className:
          "badge-dark bg-green-500/10 text-green-500 border-green-500/30",
        icon: <CheckCircleIcon size={12} />,
      },
      completed: {
        label: "Concluído",
        className: "badge-dark bg-blue-500/10 text-blue-500 border-blue-500/30",
        icon: <CheckCircleIcon size={12} />,
      },
      cancelled: {
        label: "Cancelado",
        className: "badge-dark bg-red-500/10 text-red-500 border-red-500/30",
        icon: <XCircleIcon size={12} />,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  useEffect(() => {
    document.title = `Histórico de ${client?.name || "Cliente"} | Barbearia`;
  }, [client?.name]);

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando histórico..." />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12 bg-primary-light rounded-xl border border-border/50">
        <div className="text-4xl mb-3">👤</div>
        <h3 className="font-serif text-lg font-bold text-text mb-1">
          Cliente não encontrado
        </h3>
        <p className="text-text-muted text-sm">
          O cliente pode ter sido removido
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/clientes")}
        >
          Voltar para clientes
        </Button>
      </div>
    );
  }

  const hasHistory = hasClientHistory(appointments);

  return (
    <div className="pb-20">
      {/* ✅ Header Mobile - Navegação */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/clientes")}
          className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h1 className="font-serif text-lg font-bold text-text">
            Histórico do Cliente
          </h1>
          <p className="text-text-muted text-xs">
            {client.name} • {client.phone}
          </p>
        </div>
      </div>

      {/* ✅ Card do Cliente - Compacto */}
      <div className="bg-primary-light rounded-xl p-4 border border-border/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserIcon size={24} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text text-base truncate">
              {client.name}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-0.5">
                <PhoneIcon size={12} />
                {client.phone}
              </span>
              <span className="w-0.5 h-0.5 bg-text-muted rounded-full" />
              <span className="flex items-center gap-0.5">
                <CalendarIcon size={12} />
                Cliente desde {formatDate(client.created_at)}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-[8px] font-medium border ${
              client.is_active
                ? "bg-green-500/10 text-green-500 border-green-500/30"
                : "bg-red-500/10 text-red-500 border-red-500/30"
            }`}
          >
            {client.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {/* ✅ Cards de Estatísticas - Compactos */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-primary-light rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Agendamentos
              </p>
              <p className="text-lg font-bold text-text">
                {stats.totalAppointments}
              </p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <ListIcon size={16} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Gasto Total
              </p>
              <p className="text-sm font-bold text-accent">
                {stats.totalSpent > 0
                  ? formatPrice(stats.totalSpent)
                  : "R$ 0,00"}
              </p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <MoneyIcon size={16} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Ticket Médio
              </p>
              <p className="text-sm font-bold text-blue-500">
                {stats.averageTicket > 0
                  ? formatPrice(stats.averageTicket)
                  : "R$ 0,00"}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendUpIcon size={16} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Serviço Favorito
              </p>
              <p className="text-text text-xs font-semibold truncate">
                {stats.mostUsedService || "Nenhum"}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <ScissorsIcon size={16} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Timeline de Agendamentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-sm font-bold text-text flex items-center gap-1.5">
            <ClockCounterClockwiseIcon size={16} className="text-accent" />
            Histórico
          </h2>
          <div className="flex gap-1.5">
            {hasHistory && Object.keys(groupedAppointments).length > 0 && (
              <>
                <button
                  onClick={expandAll}
                  className="text-[10px] px-2 py-1 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                >
                  Expandir
                </button>
                <button
                  onClick={collapseAll}
                  className="text-[10px] px-2 py-1 bg-primary-light text-text-muted rounded-lg hover:bg-primary transition border border-border/50"
                >
                  Recolher
                </button>
              </>
            )}
          </div>
        </div>

        {!hasHistory ? (
          <div className="text-center py-16 bg-primary-light rounded-xl border border-border/50">
            <div className="text-5xl mb-4" aria-hidden="true">
              📭
            </div>
            <h3 className="font-serif text-lg font-bold text-text mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-text-muted text-sm max-w-xs mx-auto">
              {client.name} ainda não realizou nenhum agendamento na barbearia.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedAppointments).map(
              ([monthKey, monthApps]) => {
                const isExpanded = expandedMonths.has(monthKey);
                const monthLabel = getMonthLabel(monthKey);
                const monthTotal = monthApps.length;
                const monthSpent = monthApps.reduce(
                  (sum, app) => sum + Number(app.service?.price || 0),
                  0,
                );

                return (
                  <div
                    key={monthKey}
                    className="bg-primary-light rounded-xl border border-border/50 overflow-hidden"
                  >
                    {/* ✅ Cabeçalho do Mês - Touch-friendly */}
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full flex items-center justify-between p-3 hover:bg-accent/5 transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CalendarIcon size={14} className="text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-text text-sm capitalize">
                            {monthLabel}
                          </p>
                          <p className="text-text-muted text-[10px]">
                            {monthTotal} agendamento(s) •{" "}
                            {formatPrice(monthSpent)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-xs font-medium">
                          {monthTotal}
                        </span>
                        <CaretCircleRightIcon
                          size={18}
                          className={`text-accent transition-transform duration-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* ✅ Lista de Agendamentos do Mês */}
                    {isExpanded && (
                      <div className="border-t border-border/50 divide-y divide-border/30 animate-fadeIn">
                        {monthApps.map((app) => {
                          const status = getStatusBadge(app.status);
                          return (
                            <div
                              key={app.id}
                              className="p-3 hover:bg-accent/5 transition"
                            >
                              <div className="flex items-start gap-3">
                                {/* Ícone do Serviço */}
                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {app.service?.category ? (
                                    <ServiceIcon
                                      category={app.service.category}
                                      size={14}
                                    />
                                  ) : (
                                    <ScissorsIcon
                                      size={14}
                                      className="text-accent"
                                    />
                                  )}
                                </div>

                                {/* Detalhes */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-text text-sm truncate">
                                        {app.service?.name || "Serviço"}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                                        <span className="flex items-center gap-0.5">
                                          <CalendarIcon size={10} />
                                          {formatDate(app.appointment_date)}
                                        </span>
                                        <span className="w-0.5 h-0.5 bg-text-muted rounded-full" />
                                        <span className="flex items-center gap-0.5">
                                          <ClockIcon size={10} />
                                          {app.appointment_time}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-accent font-bold text-sm whitespace-nowrap">
                                      {formatPrice(
                                        Number(app.service?.price) || 0,
                                      )}
                                    </span>
                                  </div>

                                  {/* Status */}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[8px] font-medium border flex items-center gap-0.5 ${status.className}`}
                                    >
                                      {status.icon}
                                      {status.label}
                                    </span>
                                    {app.notes && (
                                      <span className="text-text-muted text-[10px] truncate max-w-[150px]">
                                        • {app.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* ✅ Ações Rápidas */}
      <div className="mt-4">
        <h2 className="font-serif text-sm font-bold text-text mb-3">
          ⚡ Ações
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            to={`/agendamentos?clientId=${client.id}`}
            className="bg-primary-light rounded-xl p-3 border border-border/50 hover:border-accent/20 transition text-center"
          >
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <CalendarIcon size={16} className="text-accent" />
            </div>
            <p className="text-text text-xs font-medium">Ver Agendamentos</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientHistory;
