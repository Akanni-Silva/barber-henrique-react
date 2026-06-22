// src/components/Layout/Footer.tsx
import { Link } from "react-router-dom";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  ScissorsIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <footer className="bg-primary-dark border-t border-border mt-auto">
      {/* ✅ Adicionar container com padding responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <ScissorsIcon
                  size={20}
                  className="text-primary-dark"
                  weight="fill"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-accent text-lg">
                  Henrique Cortes
                </h4>
                <p className="text-xs text-text-muted tracking-widest uppercase">
                  Barbearia
                </p>
              </div>
            </div>
            <p className="text-text-muted text-sm">
              Agendamento inteligente para sua barbearia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text mb-3">Links Rápidos</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>
                <Link to="/agendar" className="hover:text-accent transition">
                  Agendar
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="hover:text-accent transition">
                  Serviços
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-text mb-3">Contato</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li className="flex items-center gap-2">
                <PhoneIcon size={16} className="text-accent" /> (11) 99999-9999
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon size={16} className="text-accent" /> São Paulo, SP
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-text mb-3">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2 bg-primary-light rounded-lg"
                aria-label="Instagram"
              >
                <InstagramLogoIcon size={24} />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2 bg-primary-light rounded-lg"
                aria-label="Facebook"
              >
                <FacebookLogoIcon size={24} />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-accent transition p-2 bg-primary-light rounded-lg"
                aria-label="YouTube"
              >
                <YoutubeLogoIcon size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6 text-center text-text-muted text-sm">
          <p>
            © 2024 Henrique Cortes Barbearia - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
