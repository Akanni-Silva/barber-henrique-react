/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Private/Clients.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  UserIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  XIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MoneyIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { Input } from "../../components/Common/Input";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";

import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import type { Client } from "../../types";

export const Clients = () => {
  const { loading, handleRequest, endpoints } = useApi();

  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Buscar clientes
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

        // Buscar estatísticas
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

  // Buscar cliente por nome
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Se busca vazia, recarrega lista
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
    // Recarregar lista
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
      toast.info("👤 Cliente desativado!");
      // Atualizar lista
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
      toast.success("✅ Cliente ativado!");
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
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            👥 Clientes
          </h1>
          <p className="text-text-muted text-sm">
            {total} clientes cadastrados
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total</p>
              <p className="text-2xl font-bold text-text">
                {stats?.total_clients || 0}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <UserIcon size={24} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="card-primary border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Ativos</p>
              <p className="text-2xl font-bold text-green-500">
                {stats?.active_clients || 0}
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
              <p className="text-text-muted text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-accent">
                {formatPrice(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <MoneyIcon size={24} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="card-primary border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Média por Cliente</p>
              <p className="text-2xl font-bold text-blue-500">
                {stats?.average_appointments_per_client || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CalendarIcon size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nome..."
            icon={<MagnifyingGlassIcon size={20} />}
            iconPosition="left"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary flex items-center gap-2"
        >
          Buscar
        </button>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="p-2 text-text-muted hover:text-accent transition border border-border rounded-lg hover:border-accent/50"
            title="Limpar busca"
          >
            <XIcon size={20} />
          </button>
        )}
      </div>

      {/* Tabela */}
      {clients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-text-muted">
            {searchTerm
              ? "Nenhum cliente com este nome"
              : "Ainda não há clientes cadastrados"}
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
                  Contato
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden md:table-cell">
                  Última Visita
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden lg:table-cell">
                  Agendamentos
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden lg:table-cell">
                  Gasto
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium">
                  Status
                </th>
                <th className="text-right py-3 px-3 text-text-muted text-sm font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border/50 hover:bg-primary-light/50 transition"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <UserIcon size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-text font-medium text-sm">
                          {client.name}
                        </p>
                        <p className="text-text-muted text-xs sm:hidden">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <PhoneIcon size={16} className="text-text-muted" />
                      <span className="text-text text-sm">{client.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="text-text text-sm">
                      {client.last_visit ? formatDate(client.last_visit) : "—"}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className="text-text text-sm">
                      {client.total_appointments}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className="text-accent text-sm font-medium">
                      {formatPrice(client.total_spent)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.is_active
                          ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                          : "bg-red-500/10 text-red-500 border-red-500/30 border"
                      }`}
                    >
                      {client.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetails(true);
                        }}
                        className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                        title="Ver detalhes"
                      >
                        <EyeIcon size={16} />
                      </button>
                      {client.is_active ? (
                        <ConfirmPopup
                          trigger={
                            <button
                              className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                              title="Desativar"
                            >
                              <XCircleIcon size={16} />
                            </button>
                          }
                          onConfirm={() => handleDeactivate(client.id)}
                          title="Desativar Cliente"
                          message={`Tem certeza que deseja desativar o cliente "${client.name}"?`}
                          confirmText="Desativar"
                          cancelText="Cancelar"
                          variant="danger"
                        />
                      ) : (
                        <button
                          onClick={() => handleActivate(client.id)}
                          className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition"
                          title="Ativar"
                        >
                          <CheckCircleIcon size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                Detalhes do Cliente
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-text-muted hover:text-text transition"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <UserIcon size={32} className="text-accent" />
                </div>
                <div>
                  <p className="font-serif text-xl font-bold text-text">
                    {selectedClient.name}
                  </p>
                  <p className="text-text-muted text-sm flex items-center gap-1">
                    <PhoneIcon size={14} />
                    {selectedClient.phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-muted text-sm">Agendamentos</p>
                  <p className="text-text font-bold text-lg">
                    {selectedClient.total_appointments}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Gasto Total</p>
                  <p className="text-accent font-bold text-lg">
                    {formatPrice(selectedClient.total_spent)}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Última Visita</p>
                  <p className="text-text">
                    {selectedClient.last_visit
                      ? formatDate(selectedClient.last_visit)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedClient.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                        : "bg-red-500/10 text-red-500 border-red-500/30 border"
                    }`}
                  >
                    {selectedClient.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              {selectedClient.notes && (
                <div>
                  <p className="text-text-muted text-sm">Observações</p>
                  <p className="text-text text-sm bg-primary p-2 rounded-lg">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    // Aqui poderia navegar para histórico de agendamentos
                  }}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Ver Histórico
                </button>
                {selectedClient.is_active ? (
                  <ConfirmPopup
                    trigger={
                      <button className="btn-secondary text-sm py-2 px-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        Desativar
                      </button>
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
                  />
                ) : (
                  <button
                    onClick={() => {
                      handleActivate(selectedClient.id);
                      setShowDetails(false);
                    }}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Ativar
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
