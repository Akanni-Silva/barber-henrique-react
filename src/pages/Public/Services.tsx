// src/pages/Public/Services.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ScissorsIcon,
  ClockIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";

import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types";
import { Input } from "../../components/Common/Input";

export const Services = () => {
  const { loading, handleRequest, endpoints } = useApi();

  // Estados
  const [services, setServices] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  // ✅ Buscar serviços (apenas uma vez)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await handleRequest(endpoints.products.findActive());
        const servicesData = (data || []) as Product[];
        setServices(servicesData);

        // ✅ Extrair categorias com tipagem correta
        const uniqueCategories = Array.from(
          new Set(servicesData.map((s: Product) => s.category || "Geral")),
        ) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Erro ao carregar serviços");
      }
    };
    fetchServices();
  }, []); // ✅ Dependência vazia - executa apenas uma vez

  // ✅ Filtrar serviços usando useMemo (sem setState dentro do effect)
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filtrar por busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => (service.category || "Geral") === selectedCategory,
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
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="text-text-muted hover:text-accent transition p-2 rounded-lg hover:bg-primary-light"
        >
          <ArrowLeftIcon size={24} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            Nossos Serviços
          </h1>
          <p className="text-text-muted text-sm">
            {services.length} serviços disponíveis
          </p>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar serviços..."
            icon={<MagnifyingGlassIcon size={20} />}
            iconPosition="left"
          />
        </div>

        <div className="flex gap-2">
          {/* Filtro de categoria */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-primary min-w-[120px]"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Botão limpar filtros */}
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-text-muted hover:text-accent transition border border-border rounded-lg hover:border-accent/50"
            >
              <XIcon size={20} />
            </button>
          )}
        </div>
      </div>
      {/* Resultados */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="font-serif text-xl font-bold text-text mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-text-muted">
            Tente ajustar os filtros ou buscar por outro termo
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="card-primary hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1 group"
            >
              {/* Ícone ou imagem */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">✂️</div>
                {service.category && (
                  <span className="badge-gold text-xs">{service.category}</span>
                )}
              </div>

              <h3 className="font-serif text-xl font-bold text-text mb-1">
                {service.name}
              </h3>

              <p className="text-text-muted text-sm mb-4">
                {service.description || "Serviço profissional de qualidade"}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <span className="text-accent font-bold text-xl">
                    {formatPrice(service.price)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-sm flex items-center gap-1">
                    <ClockIcon size={16} />
                    {service.duration_minutes} min
                  </span>
                  <Link
                    to={`/agendar?service=${service.id}`}
                    className="text-accent hover:text-accent-light transition p-1 rounded-lg hover:bg-accent/10"
                  >
                    <ArrowLeftIcon size={20} className="rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <p className="text-text-muted mb-4">Pronto para agendar seu horário?</p>
        <Link
          to="/agendar"
          className="btn-primary inline-flex items-center gap-2"
        >
          Agendar agora
        </Link>
      </div>
    </div>
  );
};
