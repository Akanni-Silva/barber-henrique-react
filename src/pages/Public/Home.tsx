// src/pages/Public/Home.tsx
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ClockIcon,
  ScissorsIcon,
  StarIcon,
  CalendarIcon,
  UserIcon,
} from "@phosphor-icons/react";

export const Home = () => {
  return (
    <>
      {/* ✅ HERO SECTION - Com imagem de fundo */}
      <section
        className="relative rounded-2xl overflow-hidden mb-12 sm:mb-16 md:mb-20"
        aria-labelledby="hero-title"
      >
        {/* ✅ Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/80 to-primary/70 z-10"></div>
        {/* ✅ Imagem de fundo */}
        // src/pages/Public/Home.tsx (trecho modificado)
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url('https://i.imgur.com/T5uL8eS.jpeg')`, // URL direta da imagem
          }}
        ></div>
        {/* ✅ Conteúdo */}
        <div className="relative z-20 px-6 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block bg-accent/20 backdrop-blur-sm border border-accent/30 px-4 py-1.5 rounded-full mb-4 sm:mb-6">
              <span className="text-accent text-xs sm:text-sm font-medium tracking-wide">
                Desde 2024
              </span>
            </div>

            {/* Título Principal (H1) */}
            <h1
              id="hero-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text mb-4 sm:mb-6 leading-tight drop-shadow-lg"
            >
              Estilo e <br />
              <span className="text-accent drop-shadow-gold">Elegância</span> em
              cada corte
            </h1>

            {/* Subtítulo */}
            <p className="text-text-secondary text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md">
              Agende seu horário na barbearia mais exclusiva. Profissionais
              qualificados e ambiente premium.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                to="/agendar"
                className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-gold hover:shadow-gold-lg transition-all duration-300"
                aria-label="Agendar horário agora"
              >
                <CalendarIcon size={20} aria-hidden="true" />
                Agendar agora
                <ArrowRightIcon size={20} aria-hidden="true" />
              </Link>
              <Link
                to="/servicos"
                className="btn-secondary inline-flex items-center text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm"
                aria-label="Ver todos os serviços"
              >
                Ver serviços
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ SEÇÃO DE BENEFÍCIOS */}
      <section
        className="mb-12 sm:mb-16 md:mb-20"
        aria-labelledby="benefits-title"
      >
        <h2
          id="benefits-title"
          className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text mb-8 sm:mb-12"
        >
          Por que escolher a{" "}
          <span className="text-accent">Henrique Cortes</span>?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Benefício 1 */}
          <article className="card-primary text-center group hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
              <ScissorsIcon
                size={28}
                className="text-accent group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text mb-1 sm:mb-2">
              Cortes Premium
            </h3>
            <p className="text-text-muted text-sm sm:text-base">
              Técnicas exclusivas para um visual impecável.
            </p>
          </article>

          {/* Benefício 2 */}
          <article className="card-primary text-center group hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
              <ClockIcon
                size={28}
                className="text-accent group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text mb-1 sm:mb-2">
              Sem Espera
            </h3>
            <p className="text-text-muted text-sm sm:text-base">
              Agendamento inteligente sem filas.
            </p>
          </article>

          {/* Benefício 3 */}
          <article className="card-primary text-center group hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
              <StarIcon
                size={28}
                className="text-accent group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text mb-1 sm:mb-2">
              Atendimento 5 Estrelas
            </h3>
            <p className="text-text-muted text-sm sm:text-base">
              Ambiente acolhedor e profissionais dedicados.
            </p>
          </article>
        </div>
      </section>

      {/* ✅ SEÇÃO DE SERVIÇOS EM DESTAQUE */}
      <section
        className="mb-12 sm:mb-16 md:mb-20"
        aria-labelledby="services-title"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <h2
            id="services-title"
            className="font-serif text-2xl sm:text-3xl font-bold text-text"
          >
            Serviços <span className="text-accent">em Destaque</span>
          </h2>
          <Link
            to="/servicos"
            className="text-accent hover:text-accent-light transition-colors flex items-center gap-1 text-sm sm:text-base group"
          >
            Ver todos
            <ArrowRightIcon
              size={16}
              aria-hidden="true"
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="card-primary hover:border-accent/50 transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="text-4xl sm:text-5xl mb-3">{service.icon}</div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-text mb-1">
                {service.name}
              </h3>
              <p className="text-text-muted text-sm mb-3">
                {service.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-accent font-bold text-lg">
                  R$ {service.price.toFixed(2)}
                </span>
                <span className="text-text-muted text-sm">
                  {service.duration} min
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ✅ SEÇÃO DE DEPOIMENTOS */}
      <section className="mb-0" aria-labelledby="testimonials-title">
        <h2
          id="testimonials-title"
          className="font-serif text-2xl sm:text-3xl font-bold text-center text-text mb-8 sm:mb-12"
        >
          O que nossos <span className="text-accent">clientes dizem</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <blockquote className="card-primary relative">
            <span className="text-4xl text-accent/30 absolute top-2 left-4 font-serif">
              "
            </span>
            <p className="text-text-secondary text-sm sm:text-base mb-3 pt-4">
              Melhor barbearia da cidade! Atendimento impecável e cortes
              perfeitos.
            </p>
            <footer className="text-text-muted text-sm flex items-center gap-2">
              <UserIcon size={16} className="text-accent" />— João Silva,
              Cliente
            </footer>
          </blockquote>

          <blockquote className="card-primary relative">
            <span className="text-4xl text-accent/30 absolute top-2 left-4 font-serif">
              "
            </span>
            <p className="text-text-secondary text-sm sm:text-base mb-3 pt-4">
              Ambiente agradável e profissionais muito qualificados.
            </p>
            <footer className="text-text-muted text-sm flex items-center gap-2">
              <UserIcon size={16} className="text-accent" />— Maria Santos,
              Cliente
            </footer>
          </blockquote>

          <blockquote className="card-primary relative">
            <span className="text-4xl text-accent/30 absolute top-2 left-4 font-serif">
              "
            </span>
            <p className="text-text-secondary text-sm sm:text-base mb-3 pt-4">
              Agendamento fácil e rápido. Recomendo a todos!
            </p>
            <footer className="text-text-muted text-sm flex items-center gap-2">
              <UserIcon size={16} className="text-accent" />— Pedro Oliveira,
              Cliente
            </footer>
          </blockquote>
        </div>
      </section>
    </>
  );
};

// ✅ Dados mockados para serviços
const services = [
  {
    id: 1,
    name: "Corte Degradê",
    description: "Corte com degradê nas laterais",
    price: 45.0,
    duration: 30,
    icon: "",
  },
  {
    id: 2,
    name: "Barba Completa",
    description: "Barba com navalha e acabamento",
    price: 35.0,
    duration: 20,
    icon: "",
  },
  {
    id: 3,
    name: "Corte + Barba",
    description: "Combo corte e barba",
    price: 70.0,
    duration: 50,
    icon: "",
  },
];
