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
  MedalIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  InstagramLogoIcon,
  FacebookLogoIcon,
  CaretCircleRightIcon,
} from "@phosphor-icons/react";

export const Home = () => {
  const { loading, handleRequest, endpoints } = useApi();
  const { barberInfo, loading: barberLoading } = useBarberInfo();
  const [services, setServices] = useState<Product[]>([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const featuredServices = services.slice(0, isDesktop ? 6 : 4);

  useAuthRedirect({
    redirectTo: "/dashboard",
    toastMessage: "Você já está logado! Acesse seu dashboard.",
    showToast: true,
    toastDelay: 500,
  });

  const getFullAddress = () => {
    if (!barberInfo) return "Rua Exemplo, 123 - SP";

    const parts = [];
    if (barberInfo.address) parts.push(barberInfo.address);
    if (barberInfo.address_number) parts.push(barberInfo.address_number);
    if (barberInfo.city && barberInfo.state) {
      parts.push(`${barberInfo.city} - ${barberInfo.state}`);
    } else if (barberInfo.city) {
      parts.push(barberInfo.city);
    } else if (barberInfo.state) {
      parts.push(barberInfo.state);
    }

    return parts.length > 0 ? parts.join(", ") : "Rua Exemplo, 123 - SP";
  };

  const getShortAddress = () => {
    if (!barberInfo) return "Rua Exemplo, 123";

    const parts = [];
    if (barberInfo.address) parts.push(barberInfo.address);
    if (barberInfo.address_number) parts.push(barberInfo.address_number);

    return parts.length > 0 ? parts.join(", ") : "Rua Exemplo, 123";
  };

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
    <div className="pb-20 space-y-6">
      {/* ✅ Hero Section - Versão Desktop com layout mais amplo */}
      <section className="bg-gradient-to-br from-primary-light to-primary rounded-2xl p-6 md:p-10 border border-border/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Lado Esquerdo - Informações */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 border-2 border-accent/20 shadow-glow">
              {barberInfo?.avatar_url ? (
                <img
                  src={barberInfo.avatar_url}
                  alt={barberInfo.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <ScissorsIcon
                  size={isDesktop ? 40 : 32}
                  className="text-accent"
                  weight="fill"
                />
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-text">
              {barberInfo?.name || "Henrique Cortes"}
            </h1>
            <p className="text-text-muted text-sm md:text-base mt-1">
              Barbearia Premium • Estilo e Elegância
            </p>

            <div className="flex flex-wrap gap-3 mt-5 w-full md:w-auto">
              <Link
                to="/agendar"
                className="btn-primary flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-sm px-6 py-3 rounded-xl min-h-[48px]"
              >
                <CalendarIcon size={18} />
                Agendar Horário
              </Link>
              <Link
                to="/servicos"
                className="flex-1 md:flex-none bg-primary-light/80 border border-border/50 text-text text-sm px-6 py-3 rounded-xl hover:border-accent/30 transition active:scale-[0.97] min-h-[48px] inline-flex items-center justify-center gap-1.5"
              >
                <ScissorsIcon size={18} />
                Ver Serviços
              </Link>
            </div>
          </div>

          {/* ✅ Lado Direito - Info rápida (apenas desktop) */}
          {isDesktop && barberInfo && (
            <div className="flex flex-col gap-3 min-w-[200px] bg-primary/30 rounded-xl p-4 border border-border/30">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <MapPinIcon size={16} className="text-accent" />
                <span className="truncate">{getShortAddress()}</span>
              </div>
              {barberInfo.phone && (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <PhoneIcon size={16} className="text-accent" />
                  <span>{barberInfo.phone}</span>
                </div>
              )}
              {barberInfo.working_hours && (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <ClockIcon size={16} className="text-accent" />
                  <span className="truncate">{barberInfo.working_hours}</span>
                </div>
              )}
              {barberInfo.whatsapp && (
                <a
                  href={formatWhatsAppLink(barberInfo.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-500 text-sm hover:text-green-400 transition"
                >
                  <WhatsappLogoIcon size={16} weight="fill" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ✅ Ações Rápidas - Ocultas em desktop (substituídas pela navegação) */}
      {!isDesktop && (
        <section className="grid grid-cols-2 gap-3">
          <Link
            to="/agendar"
            className="bg-primary-light rounded-2xl p-4 border border-border/50 hover:border-accent/30 transition active:scale-[0.97] text-center"
          >
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CalendarIcon size={20} className="text-accent" />
            </div>
            <span className="text-text text-xs font-medium">Agendar</span>
          </Link>
          <Link
            to="/servicos"
            className="bg-primary-light rounded-2xl p-4 border border-border/50 hover:border-accent/30 transition active:scale-[0.97] text-center"
          >
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ScissorsIcon size={20} className="text-accent" />
            </div>
            <span className="text-text text-xs font-medium">Serviços</span>
          </Link>
        </section>
      )}

      {/* ✅ Serviços em Destaque - Grid adaptativo */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-base md:text-xl font-bold text-text">
            Serviços em Destaque
          </h2>
          <Link
            to="/servicos"
            className="text-accent text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all font-medium"
          >
            Ver todos <ArrowRightIcon size={isDesktop ? 16 : 12} />
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
          <div
            className={`grid ${isDesktop ? "grid-cols-3" : "grid-cols-2"} gap-3 md:gap-4`}
          >
            {featuredServices.map((service) => (
              <Link
                key={service.id}
                to={`/agendar?service=${service.id}`}
                className="group bg-primary-light rounded-2xl p-3.5 md:p-5 border border-border/50 hover:border-accent/30 transition-all active:scale-[0.97]"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div
                    className={`${isDesktop ? "w-12 h-12" : "w-10 h-10"} bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition flex-shrink-0`}
                  >
                    <ServiceIcon
                      category={service.category}
                      size={isDesktop ? 22 : 18}
                    />
                  </div>
                  {service.category && (
                    <span className="badge-gold text-[8px] capitalize px-1.5 py-0.5">
                      {categoryLabels[
                        service.category as keyof typeof categoryLabels
                      ] || service.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text text-xs md:text-sm leading-tight group-hover:text-accent transition line-clamp-1">
                  {service.name}
                </h3>
                {isDesktop && service.description && (
                  <p className="text-text-muted text-xs mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-accent font-bold text-xs md:text-sm">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-text-muted text-[10px] md:text-xs flex items-center gap-0.5">
                    <ClockIcon size={isDesktop ? 12 : 10} />{" "}
                    {service.duration_minutes}min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Por que escolher a Barbearia - Grid adaptativo */}
      <section className="bg-primary-light rounded-2xl p-5 md:p-8 border border-border/50">
        <h2 className="font-serif text-base md:text-xl font-bold text-text text-center mb-4 md:mb-6">
          Por que <span className="text-accent">escolher</span> a gente?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              className="text-center p-3 md:p-4 rounded-xl bg-primary/50 hover:bg-accent/5 transition border border-transparent hover:border-accent/10 active:scale-[0.97]"
            >
              <div
                className={`${isDesktop ? "w-12 h-12" : "w-9 h-9"} bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-1.5 md:mb-2`}
              >
                <item.icon
                  size={isDesktop ? 22 : 18}
                  className="text-accent"
                  weight="fill"
                />
              </div>
              <h4 className="font-semibold text-text text-xs md:text-sm">
                {item.label}
              </h4>
              <p className="text-text-muted text-[10px] md:text-xs">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Localização e Contato - SEM CEP */}
      <section className="bg-primary-light rounded-2xl p-4 md:p-6 border border-border/50">
        <div
          className={`flex ${isDesktop ? "flex-row" : "flex-col"} gap-4 md:gap-6`}
        >
          {/* Mapa/Endereço */}
          <div className={`${isDesktop ? "flex-1" : "w-full"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPinIcon
                  size={isDesktop ? 20 : 18}
                  className="text-accent"
                  weight="fill"
                />
              </div>
              <div>
                <p className="text-text font-medium text-sm md:text-base">
                  Onde Estamos
                </p>
                <p className="text-text-muted text-xs md:text-sm">
                  {getFullAddress()}
                </p>
              </div>
            </div>

            {/* ✅ Detalhes adicionais (apenas desktop) - SEM CEP */}
            {isDesktop && (
              <div className="ml-13 pl-2 space-y-2">
                {barberInfo?.working_hours && (
                  <p className="text-text-muted text-xs flex items-center gap-1.5">
                    <ClockIcon size={14} className="text-accent" />
                    <span>{barberInfo.working_hours}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Contato e Redes Sociais */}
          <div
            className={`${isDesktop ? "flex-1" : "w-full"} flex flex-col gap-3`}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* WhatsApp */}
              {barberInfo?.whatsapp && (
                <a
                  href={formatWhatsAppLink(barberInfo.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition active:scale-[0.97] border border-green-500/20"
                >
                  <WhatsappLogoIcon
                    size={isDesktop ? 20 : 18}
                    className="text-green-500"
                    weight="fill"
                  />
                  <span className="text-text text-xs md:text-sm font-medium">
                    WhatsApp
                  </span>
                </a>
              )}

              {/* Telefone */}
              {barberInfo?.phone && (
                <a
                  href={`tel:${barberInfo.phone.replace(/\D/g, "")}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 bg-accent/10 rounded-xl hover:bg-accent/20 transition active:scale-[0.97] border border-accent/20"
                >
                  <PhoneIcon
                    size={isDesktop ? 20 : 18}
                    className="text-accent"
                  />
                  <span className="text-text text-xs md:text-sm font-medium">
                    Ligar
                  </span>
                </a>
              )}
            </div>

            {/* Redes Sociais */}
            {(barberInfo?.instagram || barberInfo?.facebook) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-muted text-xs font-medium">
                  Redes Sociais:
                </span>
                {barberInfo.instagram && (
                  <a
                    href={`https://instagram.com/${barberInfo.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-accent/10 rounded-lg hover:bg-accent/20 transition flex items-center gap-1.5"
                  >
                    <InstagramLogoIcon size={16} className="text-accent" />
                    <span className="text-text-muted text-xs hidden md:inline">
                      {barberInfo.instagram}
                    </span>
                  </a>
                )}
                {barberInfo.facebook && (
                  <a
                    href={barberInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-accent/10 rounded-lg hover:bg-accent/20 transition flex items-center gap-1.5"
                  >
                    <FacebookLogoIcon size={16} className="text-accent" />
                    <span className="text-text-muted text-xs hidden md:inline">
                      Facebook
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ✅ Call to Action - Mais Clean */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-4 md:p-6 border border-accent/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-sm md:text-base font-bold text-text">
              Pronto para um novo estilo?
            </h3>
            <p className="text-text-muted text-xs md:text-sm">
              Agende agora e transforme seu visual
            </p>
          </div>
          <Link
            to="/agendar"
            className="btn-primary text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2 flex-shrink-0 min-h-[44px] w-full md:w-auto justify-center"
          >
            <CalendarIcon size={18} />
            Agendar
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
