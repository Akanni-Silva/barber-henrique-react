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
import { useService } from "../../contexts/ServiceContext";

export const Products = () => {
  const { loading, handleRequest, endpoints } = useApi();
  const { showServiceModal, openServiceModal, closeServiceModal } =
    useService();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

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

  // ✅ Criar produto - abre o modal via contexto
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", duration_minutes: "", category: "" });
    openServiceModal();
  };

  // ✅ Editar produto - abre o modal via contexto
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      duration_minutes: product.duration_minutes.toString(),
      category: product.category || "",
    });
    openServiceModal();
  };

  // ✅ Fechar modal via contexto
  const handleCloseModal = () => {
    closeServiceModal();
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

  // ✅ Desativar produto - COM CONFIRMAÇÃO
  const handleDeactivate = async (id: number, name: string) => {
    try {
      await handleRequest(endpoints.products.deactivate(id));
      toast.info(`Serviço "${name}" desativado`);
      const updated = products.map((p) =>
        p.id === id ? { ...p, is_active: false } : p,
      );
      setProducts(updated);
    } catch (error) {
      console.error("Erro ao desativar:", error);
      toast.error("Erro ao desativar serviço");
    }
  };

  // ✅ Ativar produto - COM CONFIRMAÇÃO
  const handleActivate = async (id: number, name: string) => {
    try {
      await handleRequest(endpoints.products.activate(id));
      toast.success(`Serviço "${name}" ativado`);
      const updated = products.map((p) =>
        p.id === id ? { ...p, is_active: true } : p,
      );
      setProducts(updated);
    } catch (error) {
      console.error("Erro ao ativar:", error);
      toast.error("Erro ao ativar serviço");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await handleRequest(endpoints.products.delete(id));
      toast.success(`Serviço "${name}" removido!`);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      setTotal(updated.length);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao deletar serviço");
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
            {total} serviços cadastrados
          </p>
        </div>
      </div>

      {/* ✅ Botão Novo Serviço - Mobile */}
      <div className="flex justify-end mb-4">
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={handleOpenCreate}
        >
          Novo
        </Button>
      </div>

      {/* ✅ Lista de Serviços - Cards Mobile */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-primary-light rounded-xl border border-border/50">
          <div className="text-4xl mb-3">✂️</div>
          <h3 className="font-serif text-lg font-bold text-text mb-1">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-text-muted text-sm">
            Clique em "Novo" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-primary-light rounded-xl p-3 border border-border/50 hover:border-accent/20 transition-all"
            >
              <div className="flex flex-col gap-2">
                {/* Serviço e Categoria */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ServiceIcon category={product.category} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-text-muted text-xs capitalize truncate">
                      {product.category
                        ? categoryLabels[
                            product.category as keyof typeof categoryLabels
                          ] || product.category
                        : "Sem categoria"}
                    </p>
                  </div>
                </div>

                {/* Preço, Duração e Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-bold text-sm">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-text-muted text-xs flex items-center gap-0.5">
                      <ClockIcon size={12} />
                      {product.duration_minutes}min
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                      product.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                        : "bg-red-500/10 text-red-500 border-red-500/30 border"
                    }`}
                  >
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* ✅ Ações - Com Confirmação para Desativar/Ativar */}
                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-border/30">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center gap-1 text-xs"
                  >
                    <PencilIcon size={14} />
                    <span className="hidden xs:inline">Editar</span>
                  </button>

                  {/* ✅ Desativar com Confirmação */}
                  {product.is_active ? (
                    <ConfirmPopup
                      trigger={
                        <button className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition flex items-center gap-1 text-xs">
                          <XCircleIcon size={14} />
                          <span className="hidden xs:inline">Desativar</span>
                        </button>
                      }
                      onConfirm={() =>
                        handleDeactivate(product.id, product.name)
                      }
                      title="Desativar Serviço"
                      message={`Tem certeza que deseja desativar o serviço "${product.name}"?`}
                      confirmText="Desativar"
                      cancelText="Cancelar"
                      variant="danger"
                      size="sm"
                    />
                  ) : (
                    /* ✅ Ativar com Confirmação */
                    <ConfirmPopup
                      trigger={
                        <button className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition flex items-center gap-1 text-xs">
                          <CheckCircleIcon size={14} />
                          <span className="hidden xs:inline">Ativar</span>
                        </button>
                      }
                      onConfirm={() => handleActivate(product.id, product.name)}
                      title="Ativar Serviço"
                      message={`Tem certeza que deseja ativar o serviço "${product.name}"?`}
                      confirmText="Ativar"
                      cancelText="Cancelar"
                      variant="success"
                      size="sm"
                    />
                  )}

                  {/* ✅ Excluir com Confirmação */}
                  <ConfirmPopup
                    trigger={
                      <button className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition flex items-center gap-1 text-xs">
                        <XIcon size={14} />
                        <span className="hidden xs:inline">Excluir</span>
                      </button>
                    }
                    onConfirm={() => handleDelete(product.id, product.name)}
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

      {/* ✅ Modal de Criar/Editar - Mobile First Otimizado */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h3 className="font-serif text-lg font-bold text-text">
                {editingProduct ? "Editar Serviço" : "Novo Serviço"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
                disabled={isSubmitting}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <Input
                label="Nome do Serviço"
                placeholder="Ex: Corte Degradê"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isSubmitting}
                containerClassName="bg-primary/50 rounded-lg p-0.5"
                className="text-sm"
                labelClassName="text-xs"
              />

              {/* ✅ Select de Categoria com contraste corrigido */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
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
                  className="w-full px-3 py-2 bg-primary border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50 appearance-none"
                  disabled={isSubmitting}
                  style={{ color: "#E8E6E3" }}
                >
                  <option
                    value=""
                    className="text-text-muted"
                    style={{ color: "#9CA3AF" }}
                  >
                    Selecione uma categoria
                  </option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="text-text"
                      style={{ color: "#E8E6E3", background: "#1A1A1A" }}
                    >
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
                containerClassName="bg-primary/50 rounded-lg p-0.5"
                className="text-sm"
                labelClassName="text-xs"
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
                containerClassName="bg-primary/50 rounded-lg p-0.5"
                className="text-sm"
                labelClassName="text-xs"
              />

              {/* Preview do ícone */}
              {formData.category && (
                <div className="flex items-center gap-3 p-3 bg-primary/50 rounded-lg border border-border/50">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <ServiceIcon
                      category={formData.category as ProductCategory}
                      size={24}
                    />
                  </div>
                  <div>
                    <p className="text-text text-xs font-medium">
                      Pré-visualização
                    </p>
                    <p className="text-text-muted text-[10px]">
                      Ícone baseado na categoria
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={<CheckCircleIcon size={16} />}
                  loading={isSubmitting}
                >
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
