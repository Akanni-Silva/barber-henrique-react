// src/components/Layout/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import {
  HouseIcon,
  ScissorsIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardIcon,
  UsersIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";

export const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // ✅ Itens para cliente (não logado) - SEM ENTRAR
  const clientItems = [
    { id: "home", to: "/", label: "Home", icon: <HouseIcon size={24} /> },
    {
      id: "servicos",
      to: "/servicos",
      label: "Serviços",
      icon: <ScissorsIcon size={24} />,
    },
    {
      id: "agendar",
      to: "/agendar",
      label: "Agendar",
      icon: <CalendarIcon size={24} />,
    },
    // ❌ Removido o item "Entrar"
  ];

  // ✅ Itens para barbeiro (logado)
  const barberItems = [
    {
      id: "dashboard",
      to: "/dashboard",
      label: "Dashboard",
      icon: <ChartBarIcon size={24} />,
    },
    {
      id: "agendamentos",
      to: "/agendamentos",
      label: "Agendamentos",
      icon: <ClipboardIcon size={24} />,
    },
    {
      id: "clientes",
      to: "/clientes",
      label: "Clientes",
      icon: <UsersIcon size={24} />,
    },
    {
      id: "servicos-admin",
      to: "/servicos-admin",
      label: "Serviços",
      icon: <ScissorsIcon size={24} />,
    },
    {
      id: "agenda",
      to: "/agenda",
      label: "Agenda",
      icon: <ClockIcon size={24} />,
    },
  ];

  // ✅ Montar lista baseada no estado de autenticação
  const items = isAuthenticated ? barberItems : clientItems;

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    if (to === "/dashboard") return location.pathname.startsWith("/dashboard");
    if (to === "/agendamentos")
      return location.pathname.startsWith("/agendamentos");
    if (to === "/clientes") return location.pathname.startsWith("/clientes");
    if (to === "/servicos") return location.pathname.startsWith("/servicos");
    if (to === "/agendar") return location.pathname.startsWith("/agendar");
    if (to === "/servicos-admin")
      return location.pathname === "/servicos-admin";
    if (to === "/agenda") return location.pathname === "/agenda";
    return location.pathname === to;
  };

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-lg border-t border-border/30 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 h-16">
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[48px] transition-all duration-200 relative ${
                active ? "text-accent" : "text-text-muted hover:text-text"
              }`}
            >
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
              )}
              {item.icon}
              <span
                className={`text-[10px] font-medium ${active ? "text-accent" : "text-text-muted"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
