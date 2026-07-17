// src/pages/Private/Products.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  XIcon,
  ClockIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_minutes: "",
    category: "" as ProductCategory | "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

        // ✅ Garantir que products seja sempre um array
        const productsData = data?.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTotal(data?.total || 0);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos");
        setProducts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, handleRequest, endpoints.products, limit]);

  // ✅ Filtrar produtos por busca - com verificação de array
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = searchTerm.trim()
    ? safeProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : safeProducts;

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
      const productsData = data?.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Desativar produto - COM CONFIRMAÇÃO
  const handleDeactivate = async (id: number, name: string) => {
    try {
      await handleRequest(endpoints.products.deactivate(id));
      toast.info(`Serviço "${name}" desativado`);
      const updated = safeProducts.map((p) =>
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
      const updated = safeProducts.map((p) =>
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
      const updated = safeProducts.filter((p) => p.id !== id);
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
      {/* ✅ Header com Navegação e Estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-text">
              Serviços
            </h1>
            <p className="text-text-muted text-xs md:text-sm">
              {filteredProducts.length} de {total} serviço(s) cadastrado(s)
            </p>
          </div>
        </div>
        {isDesktop && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-text-muted text-xs bg-primary-light/50 px-3 py-1.5 rounded-lg border border-border/50">
              <span className="font-medium">Total:</span>
              <span className="text-text font-bold">{total}</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleOpenCreate}
            >
              Novo Serviço
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Barra de Busca - Adaptativa */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar serviços..."
            className="w-full pl-10 pr-3 py-2.5 md:py-3 bg-primary-light border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="p-2.5 text-text-muted hover:text-accent transition rounded-xl border border-border/50 hover:border-accent/30 flex-shrink-0 min-h-[44px]"
          >
            <XIcon size={16} />
          </button>
        )}
        {!isDesktop && (
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={handleOpenCreate}
            className="min-h-[44px]"
          >
            Novo
          </Button>
        )}
      </div>

      {/* ✅ Lista de Serviços - Cards Adaptativos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-5xl mb-4">🤔</div>
          <h3 className="font-serif text-lg font-bold text-text mb-2">
            {searchTerm
              ? "Nenhum serviço encontrado"
              : "Nenhum serviço cadastrado"}
          </h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            {searchTerm
              ? "Tente ajustar os filtros ou a busca"
              : "Clique em 'Novo Serviço' para começar"}
          </p>
          {searchTerm && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setSearchTerm("")}
            >
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-primary-light rounded-xl p-4 md:p-5 border border-border/50 hover:border-accent/20 transition-all"
            >
              <div className="flex flex-col gap-3">
                {/* Serviço e Categoria */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ServiceIcon
                        category={product.category}
                        size={isDesktop ? 22 : 16}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm md:text-base truncate max-w-[150px]">
                        {product.name}
                      </p>
                      <p className="text-text-muted text-xs md:text-sm capitalize truncate">
                        {product.category
                          ? categoryLabels[
                              product.category as keyof typeof categoryLabels
                            ] || product.category
                          : "Sem categoria"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] md:text-xs font-medium ${
                      product.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/30 border"
                        : "bg-red-500/10 text-red-500 border-red-500/30 border"
                    }`}
                  >
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Preço e Duração */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-accent font-bold text-base md:text-lg">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-text-muted text-xs md:text-sm flex items-center gap-0.5">
                    <ClockIcon size={isDesktop ? 14 : 12} />
                    {product.duration_minutes}min
                  </span>
                </div>

                {/* ✅ Ações - Mobile com botões maiores */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/30">
                  {/* Editar */}
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2.5 md:p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition flex items-center gap-1.5 text-xs font-medium min-h-[44px] md:min-h-[36px]"
                  >
                    <PencilIcon size={isDesktop ? 16 : 18} />
                    <span className="hidden xs:inline">Editar</span>
                  </button>

                  {/* Desativar/Ativar com Confirmação - Botão diferenciado */}
                  {product.is_active ? (
                    <ConfirmPopup
                      trigger={
                        <button className="p-2.5 md:p-2 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition flex items-center gap-1.5 text-xs font-medium min-h-[44px] md:min-h-[36px]">
                          <EyeSlashIcon size={isDesktop ? 16 : 18} />
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
                      variant="warning"
                      size="sm"
                    />
                  ) : (
                    <ConfirmPopup
                      trigger={
                        <button className="p-2.5 md:p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition flex items-center gap-1.5 text-xs font-medium min-h-[44px] md:min-h-[36px]">
                          <EyeIcon size={isDesktop ? 16 : 18} />
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

                  {/* Excluir com Confirmação - Botão vermelho diferenciado */}
                  <ConfirmPopup
                    trigger={
                      <button className="p-2.5 md:p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition flex items-center gap-1.5 text-xs font-medium min-h-[44px] md:min-h-[36px]">
                        <TrashIcon size={isDesktop ? 16 : 18} />
                        <span className="hidden xs:inline">Excluir</span>
                      </button>
                    }
                    onConfirm={() => handleDelete(product.id, product.name)}
                    title="Excluir Serviço"
                    message={`Tem certeza que deseja excluir o serviço "${product.name}"? Esta ação não pode ser desfeita.`}
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

      {/* ✅ Paginação - Adaptativa */}
      {total > limit && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-border/50 mt-4">
          <p className="text-text-muted text-xs md:text-sm">
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
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium min-w-[40px] text-center">
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

      {/* ✅ Modal de Criar/Editar - Mobile First Otimizado */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slideUp">
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

            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4">
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
                className="text-sm md:text-base"
                labelClassName="text-xs md:text-sm"
              />

              {/* Select de Categoria */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  className="text-sm md:text-base"
                  labelClassName="text-xs md:text-sm"
                />

                <Input
                  label="Duração (minutos)"
                  type="number"
                  placeholder="30"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                  required
                  disabled={isSubmitting}
                  helperText="Tempo estimado para o serviço"
                  containerClassName="bg-primary/50 rounded-lg p-0.5"
                  className="text-sm md:text-base"
                  labelClassName="text-xs md:text-sm"
                />
              </div>

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
