/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  ScissorsIcon,
  ChartBarIcon,
  ClipboardIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  SignOutIcon,
  HouseIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import { useBarberInfo } from "../../contexts/BarberInfoContext";
import { ConfirmPopup } from "../Common/ConfirmPopup";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  getBarberLogo,
  getBarberInitial,
  getBarberName,
} from "../../utils/logo";
import { useLogout } from "../../hooks/useLogout";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

export const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { barberInfo } = useBarberInfo();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logout } = useLogout({
    redirectTo: "/",
    showToast: true,
  });

  const clientItems: NavItem[] = [
    {
      icon: <HouseIcon size={22} />,
      label: "Home",
      to: "/",
    },
    {
      icon: <ScissorsIcon size={22} />,
      label: "Serviços",
      to: "/servicos",
    },
    {
      icon: <CalendarIcon size={22} />,
      label: "Agendar",
      to: "/agendar",
    },
  ];

  const barberItems: NavItem[] = [
    {
      icon: <ChartBarIcon size={22} />,
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      icon: <ClipboardIcon size={22} />,
      label: "Agendamentos",
      to: "/agendamentos",
    },
    {
      icon: <UsersIcon size={22} />,
      label: "Clientes",
      to: "/clientes",
    },
    {
      icon: <ScissorsIcon size={22} />,
      label: "Serviços",
      to: "/servicos-admin",
    },
    {
      icon: <CalendarIcon size={22} />,
      label: "Agenda",
      to: "/agenda",
    },
  ];

  const bottomItems = isAuthenticated
    ? [
        {
          icon: <UserIcon size={22} />,
          label: "Perfil",
          to: "/perfil",
        },
      ]
    : [];

  const navItems = isAuthenticated ? barberItems : clientItems;

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

  const logoUrl = getBarberLogo(barberInfo);
  const initial = getBarberInitial(barberInfo);
  const barberName = getBarberName(barberInfo);

  return (
    <aside
      className={`bg-primary-light border-r border-border/50 flex flex-col transition-all duration-400 ${
        isCollapsed ? "w-20" : "w-64"
      } h-screen sticky top-0`} // ✅ Adicionar sticky e h-screen
    >
      {/* ✅ Logo com Avatar da Barbearia - Fixo no topo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/50 flex-shrink-0">
        {!isCollapsed ? (
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-accent/10 flex items-center justify-center border-2 border-accent/20 flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={barberName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-accent font-serif text-lg font-bold">
                  {initial}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-serif text-base font-bold text-text truncate block">
                {barberName}
              </span>
              <span className="text-text-muted text-[10px] truncate block">
                {isAuthenticated ? "Painel de Controle" : "Barbearia Premium"}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="w-10 h-10 rounded-xl overflow-hidden bg-accent/10 flex items-center justify-center border-2 border-accent/20 mx-auto flex-shrink-0"
            title={barberName}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={barberName}
                className="w-full h-full object-cover"
              />
            ) : (
              <ScissorsIcon size={20} className="text-accent" weight="fill" />
            )}
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-text-muted hover:text-accent transition p-1 rounded-lg hover:bg-accent/10 flex-shrink-0"
        >
          {isCollapsed ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ✅ Navegação - Scrollável independente */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:bg-accent/5 hover:text-text"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ✅ Bottom Items - Fixo no rodapé */}
      <div className="border-t border-border/50 px-3 py-4 flex-shrink-0">
        {isAuthenticated && (
          <>
            <div className="space-y-1">
              {bottomItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:bg-accent/5 hover:text-text"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}

              <ConfirmPopup
                trigger={
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-500/10 group ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    title={isCollapsed ? "Sair" : undefined}
                  >
                    <span className="flex-shrink-0">
                      <SignOutIcon size={22} />
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium">Sair</span>
                    )}
                  </button>
                }
                onConfirm={logout}
                title="Sair da conta"
                message="Tem certeza que deseja sair da sua conta?"
                confirmText="Sair"
                cancelText="Cancelar"
                variant="danger"
                size="sm"
              />
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="space-y-1">
            <Link
              to="/login"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-text-muted hover:bg-accent/5 hover:text-text group ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Entrar" : undefined}
            >
              <span className="flex-shrink-0">
                <UserIcon size={22} />
              </span>
              {!isCollapsed && (
                <span className="text-sm font-medium">Área do Barbeiro</span>
              )}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
