// src/pages/Public/Home.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { useApi } from "../../hooks/useApi";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Spinner } from "../../components/Common/Spinner";
import { formatPrice } from "../../utils/formatPrice";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useBarberInfo } from "../../contexts/BarberInfoContext";
import type { Product } from "../../types";
import { categoryLabels } from "../../types";

import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ScissorsIcon,
  StarIcon,
  WhatsappLogoIcon,
  ShieldCheckIcon,
  SparkleIcon,
  UsersIcon,
  MedalIcon,
} from "@phosphor-icons/react";

export const Home = () => {
  const { loading, handleRequest, endpoints } = useApi();
  const { barberInfo, loading: barberLoading } = useBarberInfo();
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

  // ✅ Função para formatar endereço completo
  const getFullAddress = () => {
    if (!barberInfo) return "Rua Exemplo, 123 - SP";

    const parts = [];
    if (barberInfo.address) parts.push(barberInfo.address);
    if (barberInfo.address_number) parts.push(barberInfo.address_number);
    if (barberInfo.neighborhood) parts.push(barberInfo.neighborhood);
    if (barberInfo.city && barberInfo.state) {
      parts.push(`${barberInfo.city} - ${barberInfo.state}`);
    } else if (barberInfo.city) {
      parts.push(barberInfo.city);
    } else if (barberInfo.state) {
      parts.push(barberInfo.state);
    }

    return parts.length > 0 ? parts.join(", ") : "Rua Exemplo, 123 - SP";
  };

  // ✅ Formatar número do WhatsApp
  const formatWhatsAppLink = (phone: string) => {
    if (!phone) return "#";
    const cleaned = phone.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  if (loading || barberLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-5">
      {/* ✅ Hero Section - Com dados do barbeiro */}
      <section className="bg-gradient-to-br from-primary-light to-primary rounded-2xl p-6 border border-border/50 text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 border-2 border-accent/20 shadow-glow">
            {barberInfo?.avatar_url ? (
              <img
                src={barberInfo.avatar_url}
                alt={barberInfo.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <ScissorsIcon size={32} className="text-accent" weight="fill" />
            )}
          </div>
          <h1 className="font-serif text-2xl font-bold text-text">
            {barberInfo?.name || "Henrique Cortes"}
          </h1>
          <p className="text-text-muted text-sm mt-1 max-w-xs">
             Barbearia Premium • Estilo e Elegância
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              <StarIcon size={14} className="text-accent" weight="fill" />
              <StarIcon size={14} className="text-accent" weight="fill" />
              <StarIcon size={14} className="text-accent" weight="fill" />
              <StarIcon size={14} className="text-accent" weight="fill" />
              <StarIcon size={14} className="text-accent" weight="fill" />
            </div>
            <span className="text-text-muted text-xs font-medium">
              4.9 (120)
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-5 w-full">
            <Link
              to="/agendar"
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl min-h-[48px]"
            >
              <CalendarIcon size={18} />
              Agendar Horário
            </Link>
            <Link
              to="/servicos"
              className="flex-1 bg-primary-light/80 border border-border/50 text-text text-sm px-4 py-3 rounded-xl hover:border-accent/30 transition active:scale-[0.97] min-h-[48px] inline-flex items-center justify-center gap-1.5"
            >
              <ScissorsIcon size={18} />
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>

      

      {/* ✅ Serviços em Destaque - Mais Limpo */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-base font-bold text-text">
            Serviços em Destaque
          </h2>
          <Link
            to="/servicos"
            className="text-accent text-xs flex items-center gap-1 hover:gap-2 transition-all font-medium"
          >
            Ver todos <ArrowRightIcon size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner color="#C9A84C" size={14} text="Carregando serviços..." />
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="text-center py-8 text-text-muted bg-primary-light rounded-2xl border border-border/50">
            <div className="text-3xl mb-2">🤔</div>
            <p className="text-sm font-medium">Nenhum serviço disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featuredServices.map((service) => (
              <Link
                key={service.id}
                to={`/agendar?service=${service.id}`}
                className="group bg-primary-light rounded-2xl p-3.5 border border-border/50 hover:border-accent/30 transition-all active:scale-[0.97]"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition flex-shrink-0">
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

      {/* ✅ Por que escolher a Barbearia - Mais Clean */}
      <section className="bg-primary-light rounded-2xl p-5 border border-border/50">
        <h2 className="font-serif text-base font-bold text-text text-center mb-4">
          Por que <span className="text-accent">escolher</span> a gente?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MedalIcon, label: "Qualidade", desc: "Serviços premium" },
            {
              icon: SparkleIcon,
              label: "Tendências",
              desc: "Sempre atualizados",
            },
            { icon: ClockIcon, label: "Agilidade", desc: "Sem filas" },
            {
              icon: ShieldCheckIcon,
              label: "Confiança",
              desc: "Profissionais",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-3 rounded-xl bg-primary/50 hover:bg-accent/5 transition border border-transparent hover:border-accent/10 active:scale-[0.97]"
            >
              <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <item.icon size={18} className="text-accent" weight="fill" />
              </div>
              <h4 className="font-semibold text-text text-xs">{item.label}</h4>
              <p className="text-text-muted text-[10px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Localização Simplificada - Padrão solicitado */}
      <section className="bg-primary-light rounded-2xl p-4 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPinIcon size={18} className="text-accent" weight="fill" />
            </div>
            <div>
              <p className="text-text font-medium text-sm">📍 Onde Estamos</p>
              <p className="text-text-muted text-xs">{getFullAddress()}</p>
            </div>
          </div>
          {barberInfo?.whatsapp && (
            <a
              href={formatWhatsAppLink(barberInfo.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition active:scale-[0.97]"
              aria-label={`Contato via WhatsApp - ${barberInfo.whatsapp}`}
            >
              <WhatsappLogoIcon
                size={20}
                className="text-green-500"
                weight="fill"
              />
            </a>
          )}
        </div>
      </section>

      {/* ✅ Call to Action - Mais Clean */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-4 border border-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-text">
              Pronto para um novo estilo?
            </h3>
            <p className="text-text-muted text-xs">
              Agende agora e transforme seu visual
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
    </div>
  );
};

export default Home;
