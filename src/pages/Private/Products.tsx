// src/pages/Private/Products.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  XIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { Input } from "../../components/Common/Input";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import type { Product, ProductCategory } from "../../types";
import { categoryLabels } from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

export const Products = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_minutes: "",
    category: "" as ProductCategory | "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

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

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", duration_minutes: "", category: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      duration_minutes: product.duration_minutes.toString(),
      category: product.category || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", duration_minutes: "", category: "" });
  };

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
      const payload = {
        name,
        price,
        duration_minutes,
        category: formData.category || undefined,
      };

      if (editingProduct) {
        await handleRequest(
          endpoints.products.update(editingProduct.id, payload),
        );
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await handleRequest(endpoints.products.create(payload));
        toast.success("Serviço criado com sucesso!");
      }

      handleCloseModal();

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

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await handleRequest(endpoints.products.deactivate(id));
        toast.info("Serviço desativado");
      } else {
        await handleRequest(endpoints.products.activate(id));
        toast.success("Serviço ativado");
      }

      const updated = products.map((p) =>
        p.id === id ? { ...p, is_active: !currentStatus } : p,
      );
      setProducts(updated);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await handleRequest(endpoints.products.delete(id));
      toast.success("Serviço removido!");

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
        <Spinner color="#C9A84C" size={20} text="Carregando serviços..." />
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
            ✂️ Serviços
          </h1>
          <p className="text-text-muted text-sm">
            {total} serviços cadastrados
          </p>
        </div>
      </div>

      {/* ✅ Botão Novo Serviço */}
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          size="md"
          icon={<PlusIcon size={18} />}
          onClick={handleOpenCreate}
        >
          Novo Serviço
        </Button>
      </div>

      {/* ✅ Lista de Serviços */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-6xl mb-4">✂️</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-text-muted">
            Clique em "Novo Serviço" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-primary-light rounded-2xl p-4 border border-border/50 hover:border-accent/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Serviço */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ServiceIcon category={product.category} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text truncate">
                      {product.name}
                    </p>
                    <p className="text-text-muted text-xs capitalize">
                      {product.category
                        ? categoryLabels[
                            product.category as keyof typeof categoryLabels
                          ] || product.category
                        : "Sem categoria"}
                    </p>
                  </div>
                </div>

                {/* Preço e Duração */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-accent font-bold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-text-muted text-xs flex items-center gap-1">
                    <ClockIcon size={14} />
                    {product.duration_minutes} min
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                      product.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                        : "bg-red-500/10 text-red-500 border-red-500/30 border"
                    }`}
                  >
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                    title="Editar"
                  >
                    <PencilIcon size={14} />
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
                      <XCircleIcon size={14} />
                    ) : (
                      <CheckCircleIcon size={14} />
                    )}
                  </button>

                  <ConfirmPopup
                    trigger={
                      <button
                        className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                        title="Excluir"
                      >
                        <XIcon size={14} />
                      </button>
                    }
                    onConfirm={() => handleDelete(product.id)}
                    title="Excluir Serviço"
                    message={`Tem certeza que deseja excluir o serviço "${product.name}"?`}
                    confirmText="Excluir"
                    cancelText="Cancelar"
                    variant="danger"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
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

      {/* ✅ Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10">
              <h3 className="font-serif text-lg font-bold text-text">
                {editingProduct ? "Editar Serviço" : "Novo Serviço"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-text-muted hover:text-text transition rounded-xl hover:bg-primary"
                disabled={isSubmitting}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <Input
                label="Nome do Serviço"
                placeholder="Ex: Corte Degradê"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isSubmitting}
                containerClassName="bg-primary/50 rounded-xl p-1"
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ProductCategory | "",
                    })
                  }
                  className="w-full px-4 py-3 bg-primary/50 border border-border/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma categoria</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

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
                containerClassName="bg-primary/50 rounded-xl p-1"
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
                containerClassName="bg-primary/50 rounded-xl p-1"
              />

              {/* Preview do ícone */}
              {formData.category && (
                <div className="flex items-center gap-3 p-4 bg-primary/50 rounded-xl border border-border/50">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <ServiceIcon
                      category={formData.category as ProductCategory}
                      size={28}
                    />
                  </div>
                  <div>
                    <p className="text-text text-sm font-medium">
                      Pré-visualização
                    </p>
                    <p className="text-text-muted text-xs">
                      Ícone baseado na categoria selecionada
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<CheckCircleIcon size={18} />}
                  loading={isSubmitting}
                >
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
