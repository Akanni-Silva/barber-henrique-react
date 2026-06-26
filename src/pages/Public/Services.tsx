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
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando serviços..." />
      </div>
    );
  }

  return (
    <>
      {/* ✅ Cabeçalho */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-text">Serviços</h1>
            <p className="text-text-muted text-xs">
              {services.length} disponíveis
            </p>
          </div>
          <Link
            to="/agendar"
            className="text-accent text-xs flex items-center gap-1 hover:gap-2 transition-all"
          >
            Agendar <ArrowRightIcon size={12} />
          </Link>
        </div>
      </div>

      {/* ✅ Barra de busca - Mobile First */}
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
            className="w-full pl-10 pr-3 py-2.5 bg-primary-light border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-primary-light border border-border/50 rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat as keyof typeof categoryLabels] || cat}
                </option>
              ))}
            </select>
          )}

          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="p-2.5 text-text-muted hover:text-accent transition rounded-xl border border-border/50 hover:border-accent/30 flex-shrink-0"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Resultados - Cards Compactos Mobile */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-primary-light rounded-2xl border border-border/50">
          <div className="text-4xl mb-3">🤔</div>
          <h3 className="font-serif text-lg font-bold text-text mb-1">
            Nenhum serviço encontrado
          </h3>
          <p className="text-text-muted text-sm">Tente ajustar os filtros</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              to={`/agendar?service=${service.id}`}
              className="group bg-primary-light rounded-xl p-3 border border-border/50 hover:border-accent/30 transition-all active:scale-[0.97]"
            >
              {/* Ícone */}
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition mb-2">
                <ServiceIcon category={service.category} size={20} />
              </div>

              {/* Nome */}
              <h3 className="font-semibold text-text text-sm leading-tight group-hover:text-accent transition line-clamp-1">
                {service.name}
              </h3>

              {/* Preço e Duração */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-accent font-bold text-sm">
                  {formatPrice(service.price)}
                </span>
                <span className="text-text-muted text-[10px] flex items-center gap-0.5">
                  <ClockIcon size={10} />
                  {service.duration_minutes}min
                </span>
              </div>

              {/* Badge Categoria */}
              {service.category && (
                <span className="inline-block mt-1.5 text-[8px] uppercase tracking-wider text-text-muted bg-primary/50 px-1.5 py-0.5 rounded">
                  {categoryLabels[
                    service.category as keyof typeof categoryLabels
                  ] || service.category}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* ✅ Call to Action - Compacta */}
      <div className="mt-6 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-xl p-4 border border-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-text">
              Novo estilo?
            </h3>
            <p className="text-text-muted text-xs">Agende agora</p>
          </div>
          <Link
            to="/agendar"
            className="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1 flex-shrink-0"
          >
            <CalendarIcon size={14} />
            Agendar
          </Link>
        </div>
      </div>
    </>
  );
};
