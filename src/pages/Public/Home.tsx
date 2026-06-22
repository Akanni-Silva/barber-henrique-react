// src/pages/Public/Home.tsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { useApi } from "../../hooks/useApi";

const bannerPrincipal = "https://i.imgur.com/T5uL8eS.jpeg";
import type { Product } from "../../types";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  ClockIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  MedalIcon,
  PhoneIcon,
  ScissorsIcon,
  StarIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { Spinner } from "../../components/Common/Spinner";
import { formatPrice } from "../../utils/formatPrice";

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

  const featuredServices = services.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary-dark/90 to-primary/70 z-10"></div>
        <img
          src={bannerPrincipal}
          alt="Barbearia Henrique Cortes"
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
        />

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-block bg-accent/20 backdrop-blur-sm border border-accent/30 px-4 py-1.5 rounded-full mb-4">
                <span className="text-accent text-xs sm:text-sm font-medium tracking-wide">
                  ✂️ Desde 2024
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-4 leading-tight drop-shadow-lg">
                Estilo e <br />
                <span className="text-accent drop-shadow-gold">
                  Elegância
                </span>{" "}
                em cada corte
              </h1>
              <p className="text-text-secondary text-base sm:text-lg md:text-xl mb-6 max-w-xl drop-shadow-md">
                Agende seu horário na barbearia mais exclusiva. Profissionais
                qualificados e ambiente premium.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/agendar"
                  className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                >
                  <CalendarIcon className="w-5 h-5" /> Agendar agora{" "}
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/servicos"
                  className="btn-secondary inline-flex items-center text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                >
                  Ver serviços
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços em Destaque */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Serviços <span className="text-accent">em Destaque</span>
          </h2>
          <Link
            to="/servicos"
            className="text-accent hover:text-accent-light transition-colors flex items-center gap-1 group text-sm sm:text-base"
          >
            Ver todos{" "}
            <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <Spinner color="#C9A84C" size={16} />
        ) : featuredServices.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="card-primary hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1"
              >
                <div className="text-3xl sm:text-4xl mb-3">✂️</div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-text mb-1">
                  {service.name}
                </h3>
                <p className="text-text-muted text-sm mb-3">
                  {service.description || "Serviço profissional"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-accent font-bold text-lg">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-text-muted text-sm flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> {service.duration_minutes}{" "}
                    min
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Diferenciais */}
      <section className="py-8 sm:py-12 bg-primary-light rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Por que a <span className="text-accent">Henrique Cortes</span>?
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
          {[
            { icon: MedalIcon, label: "Experiência", desc: "Desde 2024" },
            { icon: StarIcon, label: "Qualidade", desc: "Atendimento Premium" },
            { icon: ScissorsIcon, label: "Técnicas", desc: "Exclusivas" },
            { icon: ClockIcon, label: "Agilidade", desc: "Sem filas" },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-accent mx-auto mb-2" />
              <h4 className="font-semibold text-text text-sm sm:text-base">
                {item.label}
              </h4>
              <p className="text-text-muted text-xs sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/agendar"
            className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
          >
            <CalendarIcon className="w-5 h-5" /> Agendar Agora
          </Link>
        </div>
      </section>

      {/* Localização e Contato */}
      <section className="py-8 sm:py-12 bg-primary-light rounded-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Onde <span className="text-accent">Estamos</span>
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Presencial em São Paulo
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
          <div className="card-primary">
            <h3 className="font-serif font-bold text-text mb-2 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-accent" /> Endereço
            </h3>
            <p className="text-text-muted text-sm">Rua Exemplo, 123</p>
            <p className="text-text-muted text-sm">São Paulo - SP</p>
          </div>
          <div className="card-primary">
            <h3 className="font-serif font-bold text-text mb-2 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-accent" /> Horário
            </h3>
            <ul className="space-y-1 text-text-muted text-sm">
              <li className="flex justify-between">
                <span>Seg a Sex</span>
                <span className="font-medium text-text">09h às 20h</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado</span>
                <span className="font-medium text-text">09h às 16h</span>
              </li>
            </ul>
          </div>
          <div className="card-primary">
            <h3 className="font-serif font-bold text-text mb-2 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-accent" /> Contato
            </h3>
            <div className="space-y-2">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent hover:text-accent-light transition text-sm font-medium"
              >
                <PhoneIcon className="w-4 h-4" /> (11) 99999-9999
              </a>
              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="text-text-muted hover:text-accent transition"
                >
                  <InstagramLogoIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-text-muted hover:text-accent transition"
                >
                  <FacebookLogoIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-text-muted hover:text-accent transition"
                >
                  <YoutubeLogoIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
