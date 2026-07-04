// src/components/Layout/DesktopFooter.tsx
import { Link } from "react-router-dom";
import {
  InstagramLogoIcon,
  FacebookLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import { useBarberInfo } from "../../contexts/BarberInfoContext";
import { useState, useEffect } from "react";

export const DesktopFooter = () => {
  const { isAuthenticated } = useAuth();
  const { barberInfo } = useBarberInfo();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // ✅ Detectar mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Se não for desktop, não mostrar
  if (!isDesktop) {
    return null;
  }

  // ✅ Não mostrar em rotas de autenticação
  const hideRoutes = ["/login", "/register"];
  if (hideRoutes.includes(window.location.pathname)) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-light/50 border-t border-border/30 px-6 py-4 mt-6 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* ✅ Lado Esquerdo - Copyright */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-xs font-medium">
              Akanni Silva
            </span>
          </div>
          <span className="text-text-muted/30 text-xs hidden sm:inline">|</span>
          <span className="text-text-muted/60 text-[10px]">
            © {currentYear} Todos os direitos reservados
          </span>
          <span className="text-text-muted/30 text-xs hidden sm:inline">|</span>
          <span className="text-text-muted/40 text-[10px]">v1.0.0</span>
        </div>

        {/* ✅ Lado Direito - Links e Redes Sociais */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
          {/* ✅ Links úteis (apenas logado) */}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link
                to="/agendamentos"
                className="text-text-muted/60 hover:text-accent transition text-[10px] font-medium uppercase tracking-wider"
              >
                Agendamentos
              </Link>
              <Link
                to="/clientes"
                className="text-text-muted/60 hover:text-accent transition text-[10px] font-medium uppercase tracking-wider"
              >
                Clientes
              </Link>
              <Link
                to="/servicos-admin"
                className="text-text-muted/60 hover:text-accent transition text-[10px] font-medium uppercase tracking-wider"
              >
                Serviços
              </Link>
            </div>
          )}

          {/* ✅ Links públicos */}
          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link
                to="/servicos"
                className="text-text-muted/60 hover:text-accent transition text-[10px] font-medium uppercase tracking-wider"
              >
                Serviços
              </Link>
              <Link
                to="/agendar"
                className="text-text-muted/60 hover:text-accent transition text-[10px] font-medium uppercase tracking-wider"
              >
                Agendar
              </Link>
            </div>
          )}

          {/* ✅ Separador (apenas se tiver links) */}
          {(isAuthenticated || !isAuthenticated) && (
            <span className="text-text-muted/20 text-xs hidden sm:inline">
              |
            </span>
          )}

          {/* ✅ Redes Sociais */}
          <div className="flex items-center gap-1.5">
            {barberInfo?.instagram && (
              <a
                href={`https://instagram.com/${barberInfo.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted/40 hover:text-accent transition p-1.5 rounded-lg hover:bg-accent/10"
                title="Instagram"
              >
                <InstagramLogoIcon size={16} />
              </a>
            )}
            {barberInfo?.facebook && (
              <a
                href={barberInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted/40 hover:text-accent transition p-1.5 rounded-lg hover:bg-accent/10"
                title="Facebook"
              >
                <FacebookLogoIcon size={16} />
              </a>
            )}
            {barberInfo?.whatsapp && (
              <a
                href={`https://wa.me/${barberInfo.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted/40 hover:text-green-500 transition p-1.5 rounded-lg hover:bg-green-500/10"
                title="WhatsApp"
              >
                <WhatsappLogoIcon size={16} />
              </a>
            )}
          </div>

          {/* ✅ Status do Sistema */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-text-muted/40 text-[10px] hidden sm:inline">
              Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
