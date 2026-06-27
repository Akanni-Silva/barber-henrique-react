// src/pages/Public/Services.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  XIcon,
  CalendarIcon,
  ArrowRightIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types";
import { categoryLabels } from "../../types";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export const Services = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [services, setServices] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useAuthRedirect({
    redirectTo: "/dashboard",
    toastMessage: "Você já está logado! Acesse seu dashboard.",
    showToast: true,
    toastDelay: 500,
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await handleRequest(endpoints.products.findActive());
        const servicesData = (data || []) as Product[];
        setServices(servicesData);

        const uniqueCategories = Array.from(
          new Set(servicesData.map((s: Product) => s.category || "outros")),
        ) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Erro ao carregar serviços");
      }
    };
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => (service.category || "outros") === selectedCategory,
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory, services]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando serviços..." />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ✅ Cabeçalho - Mobile First */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-xl font-bold text-text">Serviços</h1>
          <p className="text-text-muted text-xs">
            {filteredServices.length} de {services.length} disponíveis
          </p>
        </div>
        <Link
          to="/agendar"
          className="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 min-h-[40px]"
        >
          <CalendarIcon size={14} />
          Agendar
        </Link>
      </div>

      {/* ✅ Barra de busca e filtros - Mobile First */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar serviços..."
            className="w-full pl-10 pr-3 py-3 bg-primary-light border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all min-h-[44px]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 px-3 py-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 text-sm min-h-[44px] ${
              showFilters
                ? "border-accent bg-accent/10 text-accent"
                : "border-border/50 text-text-muted hover:border-accent/30"
            }`}
          >
            <FunnelIcon size={16} />
            <span>Filtros</span>
            {showFilters ? (
              <span className="text-[10px]">▲</span>
            ) : (
              <span className="text-[10px]">▼</span>
            )}
          </button>

          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 rounded-xl border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition flex items-center gap-1 text-sm min-h-[44px]"
            >
              <XIcon size={16} />
              <span className="hidden xs:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* ✅ Filtros expandíveis - Mobile First */}
      {showFilters && (
        <div className="bg-primary-light rounded-xl p-4 mb-4 border border-border/50 animate-fadeIn">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Categoria
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-accent text-primary-dark"
                      : "bg-primary/50 text-text-muted hover:bg-accent/10 hover:text-text"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCategory === cat
                        ? "bg-accent text-primary-dark"
                        : "bg-primary/50 text-text-muted hover:bg-accent/10 hover:text-text"
                    }`}
                  >
                    {categoryLabels[cat as keyof typeof categoryLabels] || cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full py-2 text-xs text-text-muted hover:text-accent transition border border-border/50 rounded-lg hover:border-accent/30"
            >
              Limpar todos os filtros
            </button>
          </div>
        </div>
      )}

      {/* ✅ Resultados - Cards Mobile First */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-5xl mb-4">🤔</div>
          <h3 className="font-serif text-lg font-bold text-text mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            {searchTerm || selectedCategory !== "all"
              ? "Tente ajustar os filtros ou a busca"
              : "Ainda não temos serviços cadastrados"}
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              to={`/agendar?service=${service.id}`}
              className="group bg-primary-light rounded-2xl p-4 border border-border/50 hover:border-accent/30 transition-all active:scale-[0.97]"
            >
              {/* Ícone e Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition flex-shrink-0">
                  <ServiceIcon category={service.category} size={22} />
                </div>
                {service.category && (
                  <span className="badge-gold text-[8px] capitalize px-2 py-0.5">
                    {categoryLabels[
                      service.category as keyof typeof categoryLabels
                    ] || service.category}
                  </span>
                )}
              </div>

              {/* Nome */}
              <h3 className="font-semibold text-text text-sm leading-tight group-hover:text-accent transition line-clamp-1">
                {service.name}
              </h3>

              {/* Descrição */}
              {service.description && (
                <p className="text-text-muted text-xs mt-1 line-clamp-1">
                  {service.description}
                </p>
              )}

              {/* Preço e Duração */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-accent font-bold text-sm">
                  {formatPrice(service.price)}
                </span>
                <span className="text-text-muted text-xs flex items-center gap-1">
                  <ClockIcon size={12} />
                  {service.duration_minutes}min
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ✅ Call to Action - Mobile First */}
      {filteredServices.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-2xl p-4 border border-accent/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-sm font-bold text-text">
                Pronto para escolher?
              </h3>
              <p className="text-text-muted text-xs">
                Agende seu horário agora
              </p>
            </div>
            <Link
              to="/agendar"
              className="btn-primary text-sm px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 flex-shrink-0 min-h-[44px]"
            >
              <CalendarIcon size={16} />
              Agendar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
