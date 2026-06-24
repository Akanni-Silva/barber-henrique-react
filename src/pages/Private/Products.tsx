/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/Private/Products.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ScissorsIcon,
  PlusIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  XIcon,
  ClockIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { Input } from "../../components/Common/Input";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types";

export const Products = () => {
  const { loading, handleRequest, endpoints } = useApi();

  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_minutes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await handleRequest(
          endpoints.products.findAll({
            page,
            limit,
          }),
        );
        setProducts(data?.products || []);
        setTotal(data?.total || 0);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  // Abrir modal para criar
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", duration_minutes: "" });
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      duration_minutes: product.duration_minutes.toString(),
    });
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", duration_minutes: "" });
  };

  // Salvar produto
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    const duration_minutes = parseInt(formData.duration_minutes);

    if (
      !name ||
      isNaN(price) ||
      isNaN(duration_minutes) ||
      duration_minutes <= 0
    ) {
      toast.warning("Preencha todos os campos corretamente");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Editar
        await handleRequest(
          endpoints.products.update(editingProduct.id, {
            name,
            price,
            duration_minutes,
          }),
        );
        toast.success("✅ Serviço atualizado com sucesso!");
      } else {
        // Criar
        await handleRequest(
          endpoints.products.create({
            name,
            price,
            duration_minutes,
          }),
        );
        toast.success("✅ Serviço criado com sucesso!");
      }

      handleCloseModal();

      // Recarregar lista
      const data = await handleRequest(
        endpoints.products.findAll({ page, limit }),
      );
      setProducts(data?.products || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ativar/Desativar produto
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await handleRequest(endpoints.products.deactivate(id));
        toast.info("⏸️ Serviço desativado");
      } else {
        await handleRequest(endpoints.products.activate(id));
        toast.success("✅ Serviço ativado");
      }

      const updated = products.map((p) =>
        p.id === id ? { ...p, is_active: !currentStatus } : p,
      );
      setProducts(updated);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  // Deletar produto
  const handleDelete = async (id: number) => {
    try {
      await handleRequest(endpoints.products.delete(id));
      toast.success("🗑️ Serviço removido!");

      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      setTotal(updated.length);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            ✂️ Serviços
          </h1>
          <p className="text-text-muted text-sm">
            {total} serviços cadastrados
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <PlusIcon size={20} />
          Novo Serviço
        </button>
      </div>

      {/* Tabela */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✂️</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-text-muted">
            Clique em "Novo Serviço" para começar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium">
                  Serviço
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium">
                  Preço
                </th>
                <th className="text-left py-3 px-3 text-text-muted text-sm font-medium hidden sm:table-cell">
                  Duração
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
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/50 hover:bg-primary-light/50 transition"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <ScissorsIcon size={16} className="text-accent" />
                      </div>
                      <span className="text-text font-medium text-sm">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-accent font-medium text-sm">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="text-text text-sm flex items-center gap-1">
                      <ClockIcon size={14} className="text-text-muted" />
                      {product.duration_minutes} min
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                          : "bg-red-500/10 text-red-500 border-red-500/30 border"
                      }`}
                    >
                      {product.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                        title="Editar"
                      >
                        <PencilIcon size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                        className={`p-1.5 rounded-lg transition ${
                          product.is_active
                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        }`}
                        title={product.is_active ? "Desativar" : "Ativar"}
                      >
                        {product.is_active ? (
                          <XCircleIcon size={16} />
                        ) : (
                          <CheckCircleIcon size={16} />
                        )}
                      </button>

                      <ConfirmPopup
                        trigger={
                          <button
                            className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                            title="Excluir"
                          >
                            <XIcon size={16} />
                          </button>
                        }
                        onConfirm={() => handleDelete(product.id)}
                        title="Excluir Serviço"
                        message={`Tem certeza que deseja excluir o serviço "${product.name}"?`}
                        confirmText="Excluir"
                        cancelText="Cancelar"
                        variant="danger"
                      />
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

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                {editingProduct ? "Editar Serviço" : "Novo Serviço"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text transition"
                disabled={isSubmitting}
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Nome do Serviço"
                placeholder="Ex: Corte Degradê"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isSubmitting}
              />

              <Input
                label="Preço"
                type="number"
                step="0.01"
                placeholder="45,00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                disabled={isSubmitting}
                helperText="Use ponto para decimais (ex: 45.50)"
              />

              <Input
                label="Duração (minutos)"
                type="number"
                placeholder="30"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: e.target.value })
                }
                required
                disabled={isSubmitting}
                helperText="Tempo estimado para o serviço"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner color="#1A1A1A" size={10} />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={18} />
                      <span>{editingProduct ? "Atualizar" : "Criar"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
