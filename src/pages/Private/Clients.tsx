// src/pages/Private/Clients.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  XIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MoneyIcon,
  ArrowLeftIcon,
  UsersIcon,
  TrendUpIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import type { Client } from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

export const Clients = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const data = await handleRequest(
          endpoints.clients.findAll({
            page,
            limit,
          }),
        );
        setClients(data?.clients || []);
        setTotal(data?.total || 0);

        const statsData = await handleRequest(endpoints.clients.getStats());
        setStats(statsData || null);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Erro ao carregar clientes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [page]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      const data = await handleRequest(
        endpoints.clients.findAll({ page, limit }),
      );
      setClients(data?.clients || []);
      setTotal(data?.total || 0);
      return;
    }

    setIsLoading(true);
    try {
      const data = await handleRequest(
        endpoints.clients.searchByName(searchTerm, limit),
      );
      setClients(data || []);
      setTotal(data?.length || 0);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao buscar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const fetchClients = async () => {
      const data = await handleRequest(
        endpoints.clients.findAll({ page, limit }),
      );
      setClients(data?.clients || []);
      setTotal(data?.total || 0);
    };
    fetchClients();
  };

  const handleDeactivate = async (id: number) => {
    try {
      await handleRequest(endpoints.clients.deactivate(id));
      toast.info("Cliente desativado!");
      const updated = clients.map((client) =>
        client.id === id ? { ...client, is_active: false } : client,
      );
      setClients(updated);
    } catch (error) {
      console.error("Erro ao desativar:", error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await handleRequest(endpoints.clients.activate(id));
      toast.success("Cliente ativado!");
      const updated = clients.map((client) =>
        client.id === id ? { ...client, is_active: true } : client,
      );
      setClients(updated);
    } catch (error) {
      console.error("Erro ao ativar:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando clientes..." />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ✅ Header Mobile - Navegação */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          to="/dashboard"
          className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
        >
          <ArrowLeftIcon size={18} />
        </Link>
        <div>
          <p className="text-text-muted text-xs">
            {total} clientes cadastrados
          </p>
        </div>
      </div>

      {/* ✅ Cards de Estatísticas - Compactos Mobile */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-primary-light rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-bold text-text">
                {stats?.total_clients || 0}
              </p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <UsersIcon size={16} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-xl p-3 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                Ativos
              </p>
              <p className="text-lg font-bold text-green-500">
                {stats?.active_clients || 0}
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
                {formatPrice(stats?.total_revenue || 0)}
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
                Média
              </p>
              <p className="text-lg font-bold text-blue-500">
                {stats?.average_appointments_per_client || 0}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendUpIcon size={16} className="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Barra de Busca - Mobile First */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-10 pr-3 py-2.5 bg-primary-light border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<MagnifyingGlassIcon size={16} />}
          onClick={handleSearch}
        >
          Buscar
        </Button>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="p-2.5 text-text-muted hover:text-accent transition rounded-xl border border-border/50 hover:border-accent/30 flex-shrink-0"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* ✅ Lista de Clientes - Cards Mobile */}
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-primary-light rounded-xl border border-border/50">
          <div className="text-4xl mb-3">👤</div>
          <h3 className="font-serif text-lg font-bold text-text mb-1">
            Nenhum cliente encontrado
          </h3>
          <p className="text-text-muted text-sm">
            {searchTerm
              ? "Nenhum cliente com este nome"
              : "Ainda não há clientes cadastrados"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-primary-light rounded-xl p-3 border border-border/50 hover:border-accent/20 transition-all"
            >
              <div className="flex flex-col gap-2">
                {/* Cliente */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserIcon size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm truncate">
                      {client.name}
                    </p>
                    <p className="text-text-muted text-xs flex items-center gap-0.5">
                      <PhoneIcon size={10} />
                      {client.phone}
                    </p>
                  </div>
                </div>

                {/* Stats compactos */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-0.5 text-text-muted">
                    <CalendarIcon size={12} />
                    {client.last_visit
                      ? formatDate(client.last_visit)
                      : "Sem visitas"}
                  </span>
                  <span className="flex items-center gap-0.5 text-text-muted">
                    <UsersIcon size={12} />
                    {client.total_appointments}
                  </span>
                  <span className="flex items-center gap-0.5 text-accent font-medium">
                    <MoneyIcon size={12} />
                    {formatPrice(client.total_spent)}
                  </span>
                </div>

                {/* ✅ Ações - Com Histórico */}
                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-border/30">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                      client.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                        : "bg-red-500/10 text-red-500 border-red-500/30 border"
                    }`}
                  >
                    {client.is_active ? "Ativo" : "Inativo"}
                  </span>

                  {/* ✅ Botão Histórico */}
                  <Link
                    to={`/clientes/${client.id}/historico`}
                    className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center gap-1 text-xs"
                  >
                    <ClockCounterClockwiseIcon size={14} />
                    <span className="hidden xs:inline">Histórico</span>
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetails(true);
                    }}
                    className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center gap-1 text-xs"
                  >
                    <EyeIcon size={14} />
                    <span className="hidden xs:inline">Detalhes</span>
                  </button>

                  {client.is_active ? (
                    <ConfirmPopup
                      trigger={
                        <button className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition flex items-center gap-1 text-xs">
                          <XCircleIcon size={14} />
                          <span className="hidden xs:inline">Desativar</span>
                        </button>
                      }
                      onConfirm={() => handleDeactivate(client.id)}
                      title="Desativar Cliente"
                      message={`Tem certeza que deseja desativar o cliente "${client.name}"?`}
                      confirmText="Desativar"
                      cancelText="Cancelar"
                      variant="danger"
                      size="sm"
                    />
                  ) : (
                    <button
                      onClick={() => handleActivate(client.id)}
                      className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition flex items-center gap-1 text-xs"
                    >
                      <CheckCircleIcon size={14} />
                      <span className="hidden xs:inline">Ativar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Paginação - Mobile First */}
      {total > limit && (
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-border/50 mt-4">
          <p className="text-text-muted text-xs">
            {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border/50 rounded-xl text-text-muted hover:text-text hover:border-accent/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium min-w-[40px] text-center">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 border border-border/50 rounded-xl text-text-muted hover:text-text hover:border-accent/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* ✅ Modal de Detalhes - Mobile First (Centralizado) */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10">
              <h3 className="font-serif text-lg font-bold text-text">
                Detalhes do Cliente
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Perfil */}
              <div className="flex items-center gap-3 p-3 bg-primary/50 rounded-xl">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <UserIcon size={24} className="text-accent" />
                </div>
                <div>
                  <p className="font-serif text-base font-bold text-text">
                    {selectedClient.name}
                  </p>
                  <p className="text-text-muted text-xs flex items-center gap-0.5">
                    <PhoneIcon size={12} /> {selectedClient.phone}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-primary/50 rounded-lg">
                  <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                    Agendamentos
                  </p>
                  <p className="text-text font-bold text-base">
                    {selectedClient.total_appointments}
                  </p>
                </div>
                <div className="p-2.5 bg-primary/50 rounded-lg">
                  <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                    Gasto Total
                  </p>
                  <p className="text-accent font-bold text-base">
                    {formatPrice(selectedClient.total_spent)}
                  </p>
                </div>
                <div className="p-2.5 bg-primary/50 rounded-lg col-span-2">
                  <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                    Última Visita
                  </p>
                  <p className="text-text text-sm">
                    {selectedClient.last_visit
                      ? formatDate(selectedClient.last_visit)
                      : "—"}
                  </p>
                </div>
                {selectedClient.notes && (
                  <div className="p-2.5 bg-primary/50 rounded-lg col-span-2">
                    <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Observações
                    </p>
                    <p className="text-text text-sm">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* ✅ Ações - Com Histórico */}
              <div className="flex flex-wrap gap-2 pt-1">
                {/* ✅ Botão Histórico */}
                <Link
                  to={`/clientes/${selectedClient.id}/historico`}
                  className="flex-1 min-w-[80px] px-3 py-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center justify-center gap-1.5 text-xs font-medium"
                >
                  <ClockCounterClockwiseIcon size={16} />
                  Histórico
                </Link>

                {selectedClient.is_active ? (
                  <ConfirmPopup
                    trigger={
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircleIcon size={14} />}
                        className="flex-1 min-w-[80px]"
                      >
                        Desativar
                      </Button>
                    }
                    onConfirm={() => {
                      handleDeactivate(selectedClient.id);
                      setShowDetails(false);
                    }}
                    title="Desativar Cliente"
                    message={`Tem certeza que deseja desativar "${selectedClient.name}"?`}
                    confirmText="Desativar"
                    cancelText="Cancelar"
                    variant="danger"
                    size="sm"
                  />
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircleIcon size={14} />}
                    onClick={() => {
                      handleActivate(selectedClient.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 min-w-[80px]"
                  >
                    Ativar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="flex-1 min-w-[80px]"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
