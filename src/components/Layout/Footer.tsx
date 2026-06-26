// src/components/Layout/Footer.tsx
import { Link } from "react-router-dom";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  ScissorsIcon,
  YoutubeLogoIcon,
  WhatsappLogoIcon,
  ClockIcon,
} from "@phosphor-icons/react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ✅ Grid Mobile First */}
        <div className="py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* ✅ Brand com logo */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-glow">
                <ScissorsIcon
                  size={24}
                  className="text-primary-dark"
                  weight="fill"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-accent text-lg">
                  Henrique Cortes
                </h4>
                <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase">
                  ✂️ Desde 2024
                </p>
              </div>
            </div>
            <p className="text-text-muted text-sm max-w-xs mx-auto sm:mx-0">
              Agendamento inteligente para sua barbearia.
            </p>
          </div>

          {/* ✅ Links Rápidos */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-text mb-3 text-sm flex items-center justify-center sm:justify-start gap-2">
              <span className="w-1 h-4 bg-accent rounded-full" />
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>
                <Link
                  to="/agendar"
                  className="hover:text-accent transition-colors flex items-center justify-center sm:justify-start gap-2 hover:gap-3"
                >
                  <span className="w-1 h-1 bg-accent/30 rounded-full" />
                  Agendar
                </Link>
              </li>
              <li>
                <Link
                  to="/servicos"
                  className="hover:text-accent transition-colors flex items-center justify-center sm:justify-start gap-2 hover:gap-3"
                >
                  <span className="w-1 h-1 bg-accent/30 rounded-full" />
                  Serviços
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-accent transition-colors flex items-center justify-center sm:justify-start gap-2 hover:gap-3"
                >
                  <span className="w-1 h-1 bg-accent/30 rounded-full" />
                  Área do Barbeiro
                </Link>
              </li>
            </ul>
          </div>

          {/* ✅ Contato e Horário */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-text mb-3 text-sm flex items-center justify-center sm:justify-start gap-2">
              <span className="w-1 h-4 bg-accent rounded-full" />
              Contato
            </h4>
            <ul className="space-y-2.5 text-text-muted text-sm">
              <li className="flex items-center justify-center sm:justify-start gap-2 hover:text-accent transition-colors">
                <PhoneIcon size={16} className="text-accent flex-shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2 hover:text-accent transition-colors">
                <WhatsappLogoIcon
                  size={16}
                  className="text-green-500 flex-shrink-0"
                />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <ClockIcon size={16} className="text-accent flex-shrink-0" />
                <span className="text-text-muted text-xs">
                  Seg-Sex: 09h - 20h | Sáb: 09h - 16h
                </span>
              </li>
            </ul>
          </div>

          {/* ✅ Redes Sociais e Localização */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-text mb-3 text-sm flex items-center justify-center sm:justify-start gap-2">
              <span className="w-1 h-4 bg-accent rounded-full" />
              Redes
            </h4>
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2.5 bg-primary-light rounded-xl hover:bg-accent/10 hover:scale-110 duration-200"
                aria-label="Instagram"
              >
                <InstagramLogoIcon size={20} />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2.5 bg-primary-light rounded-xl hover:bg-accent/10 hover:scale-110 duration-200"
                aria-label="Facebook"
              >
                <FacebookLogoIcon size={20} />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2.5 bg-primary-light rounded-xl hover:bg-accent/10 hover:scale-110 duration-200"
                aria-label="YouTube"
              >
                <YoutubeLogoIcon size={20} />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2.5 bg-primary-light rounded-xl hover:bg-accent/10 hover:scale-110 duration-200"
                aria-label="WhatsApp"
              >
                <WhatsappLogoIcon size={20} className="text-green-500" />
              </a>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-text-muted text-xs">
              <MapPinIcon size={14} className="text-accent flex-shrink-0" />
              <span>Rua Exemplo, 123 - São Paulo, SP</span>
            </div>
          </div>
        </div>

        {/* ✅ Divider com linha dourada */}
        <div className="relative">
          <div className="border-t border-border/50 py-6">
            <div className="absolute -top-px left-0 w-20 h-px bg-gradient-to-r from-accent to-transparent" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-text-muted text-xs">
              <p>
                © {currentYear} Henrique Cortes Barbearia - Todos os direitos
                reservados.
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent/50 rounded-full" />
                  Made with ✂️
                </span>
                <span className="text-border">|</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
