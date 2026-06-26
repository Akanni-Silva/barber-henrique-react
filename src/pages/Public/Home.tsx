// src/pages/Public/Home.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { useApi } from "../../hooks/useApi";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Spinner } from "../../components/Common/Spinner";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import type { Product } from "../../types";
import { categoryLabels } from "../../types";

const bannerPrincipal = "https://i.imgur.com/T5uL8eS.jpeg";

import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ScissorsIcon,
  StarIcon,
  WhatsappLogoIcon,
  UserIcon,
} from "@phosphor-icons/react";

export const Home = () => {
  const { loading, handleRequest, endpoints } = useApi();
  const [services, setServices] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await handleRequest(
          endpoints.products.findActive(),
        );
        setServices(servicesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, []);

  const featuredServices = services.slice(0, 4);

  useAuthRedirect({
    redirectTo: "/dashboard",
    toastMessage: "Você já está logado! Acesse seu dashboard.",
    showToast: true,
    toastDelay: 500,
  });

  return (
    <div className="space-y-5">
      {/* ✅ Hero Section - Compacta Mobile */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary-dark/95 via-primary/80 to-primary/60 z-10"></div>
        <img
          src={bannerPrincipal}
          alt="Barbearia Henrique Cortes"
          className="w-full h-48 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center px-5">
          <div className="max-w-xs">
            <div className="inline-flex items-center gap-1.5 bg-accent/20 backdrop-blur-sm border border-accent/30 px-3 py-1 rounded-full mb-2">
              <ScissorsIcon size={12} className="text-accent" />
              <span className="text-accent text-[10px] font-medium tracking-wider">
                EST. 2024
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-text leading-tight drop-shadow-lg">
              Estilo & <span className="text-accent">Elegância</span>
            </h1>
            <p className="text-text-secondary text-xs mt-1.5 max-w-xs drop-shadow-md">
              Agendamento inteligente para sua barbearia.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link
                to="/agendar"
                className="btn-primary inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl"
              >
                <CalendarIcon size={14} />
                Agendar
                <ArrowRightIcon size={12} />
              </Link>
              <Link
                to="/servicos"
                className="bg-primary-light/80 backdrop-blur-sm border border-border/50 text-text text-xs px-4 py-2 rounded-xl hover:border-accent/30 transition"
              >
                Ver serviços
              </Link>
            </div>
          </div>
        </div>
        {/* ✅ Badge de avaliação - Compacta */}
        <div className="absolute bottom-2 right-2 z-20 bg-primary/90 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-accent/10 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <StarIcon size={10} className="text-accent" weight="fill" />
            <StarIcon size={10} className="text-accent" weight="fill" />
            <StarIcon size={10} className="text-accent" weight="fill" />
            <StarIcon size={10} className="text-accent" weight="fill" />
            <StarIcon size={10} className="text-accent" weight="fill" />
          </div>
          <span className="text-text-muted text-[10px]">4.9 (120)</span>
        </div>
      </section>

      {/* ✅ Serviços em Destaque - Grid Mobile */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-lg font-bold text-text">
            Serviços <span className="text-accent">em Destaque</span>
          </h2>
          <Link
            to="/servicos"
            className="text-accent text-xs flex items-center gap-0.5 hover:gap-1.5 transition-all"
          >
            Ver todos <ArrowRightIcon size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner color="#C9A84C" size={14} />
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="text-center py-6 text-text-muted bg-primary-light/50 rounded-xl border border-border/50">
            <p className="text-sm">Nenhum serviço disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {featuredServices.map((service) => (
              <Link
                key={service.id}
                to={`/agendar?service=${service.id}`}
                className="group bg-primary-light rounded-xl p-3 border border-border/50 hover:border-accent/30 transition-all active:scale-[0.97]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition">
                    <ServiceIcon category={service.category} size={18} />
                  </div>
                  {service.category && (
                    <span className="badge-gold text-[8px] capitalize px-1.5 py-0.5">
                      {categoryLabels[
                        service.category as keyof typeof categoryLabels
                      ] || service.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text text-xs leading-tight group-hover:text-accent transition line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-text-muted text-[10px] mt-0.5 line-clamp-1">
                  {service.description || "Serviço profissional"}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-accent font-bold text-xs">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-text-muted text-[10px] flex items-center gap-0.5">
                    <ClockIcon size={10} /> {service.duration_minutes}min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Diferenciais - Cards Compactos */}
      <section className="bg-primary-light rounded-xl p-4 border border-border/50">
        <h2 className="font-serif text-lg font-bold text-text text-center mb-3">
          Por que a <span className="text-accent">Henrique Cortes</span>?
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: StarIcon, label: "Qualidade", desc: "Premium" },
            { icon: ScissorsIcon, label: "Técnicas", desc: "Exclusivas" },
            { icon: ClockIcon, label: "Agilidade", desc: "Sem filas" },
            { icon: UserIcon, label: "Profissionais", desc: "Experientes" },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-2.5 rounded-xl bg-primary/50 hover:bg-accent/5 transition border border-transparent hover:border-accent/10"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <item.icon className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-semibold text-text text-xs">{item.label}</h4>
              <p className="text-text-muted text-[10px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Localização e Contato - Compacto */}
      <section className="bg-primary-light rounded-xl p-4 border border-border/50">
        <h2 className="font-serif text-lg font-bold text-text text-center mb-3">
          Onde <span className="text-accent">Estamos</span>
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/50">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-text font-medium text-xs">Endereço</p>
              <p className="text-text-muted text-[10px]">
                Rua Exemplo, 123 - SP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/50">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-text font-medium text-xs">Horário</p>
              <p className="text-text-muted text-[10px]">
                Seg-Sex: 09h-20h | Sáb: 09h-16h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/50">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <WhatsappLogoIcon className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-text font-medium text-xs">Contato</p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-[10px] hover:text-accent-light transition"
              >
                (11) 99999-9999
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Call to Action - Compacto */}
      <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-xl p-4 border border-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-text">
              Novo estilo?
            </h3>
            <p className="text-text-muted text-[10px]">Agende agora</p>
          </div>
          <Link
            to="/agendar"
            className="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <CalendarIcon size={14} />
            Agendar
            <ArrowRightIcon size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};
