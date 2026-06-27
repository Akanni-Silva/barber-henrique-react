// src/components/Layout/MobileHeader.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ScissorsIcon,
  BellIcon,
  UserIcon,
  ArrowLeftIcon,
  SignInIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import { useFilter } from "../../contexts/FilterContext";
import { useService } from "../../contexts/ServiceContext";
import { ConfirmPopup } from "../Common/ConfirmPopup";
import { useState } from "react";
import { toast } from "react-toastify";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

export const MobileHeader = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  leftAction,
}: MobileHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleFilters } = useFilter();
  const { openServiceModal } = useService();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // ✅ Títulos dinâmicos por rota
  const getTitle = () => {
    if (title) return title;

    const path = location.pathname;
    const titles: Record<string, string> = {
      "/": "Henrique Cortes",
      "/servicos": "Serviços",
      "/agendar": "Agendar",
      "/dashboard": "Dashboard",
      "/agendamentos": "Agendamentos",
      "/clientes": "Clientes",
      "/servicos-admin": "Serviços",
      "/agenda": "Agenda",
      "/perfil": "Perfil",
      "/login": "Entrar",
      "/register": "Criar Conta",
    };
    return titles[path] || "Henrique Cortes";
  };

  // ✅ Subtítulos por rota
  const getSubtitle = () => {
    const path = location.pathname;

    if (isAuthenticated) {
      if (path === "/dashboard")
        return `Olá, ${user?.name?.split(" ")[0] || "Barbeiro"} 👋`;
      if (path === "/agendamentos") return "Gerencie seus agendamentos";
      if (path === "/clientes") return "Gerencie seus clientes";
      if (path === "/servicos-admin") return "Gerencie seus serviços";
      if (path === "/agenda") return "Configure sua agenda";
      if (path === "/perfil") return "Gerencie seu perfil";
      return null;
    }

    if (path === "/") return "Barbearia Premium";
    if (path === "/servicos") return "Escolha seu serviço";
    if (path === "/agendar") return "Agende seu horário";
    return null;
  };

  // ✅ Ações do lado direito por rota
  const getRightAction = () => {
    if (rightAction) return rightAction;

    const path = location.pathname;

    // Rotas do barbeiro (logado)
    if (isAuthenticated) {
      if (path === "/agendamentos") {
        return (
          <button
            className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
            onClick={toggleFilters}
          >
            <FunnelIcon size={20} />
          </button>
        );
      }
      if (path === "/servicos-admin") {
        return (
          <button
            className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
            onClick={openServiceModal}
          >
            <PlusIcon size={20} />
          </button>
        );
      }
      // ✅ Botão de Perfil com menu dropdown
      return (
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10 relative flex items-center gap-1.5"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center border border-accent/20">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || "Perfil"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={16} className="text-accent" weight="fill" />
              )}
            </div>
            <span className="text-[10px] text-text-muted hidden sm:inline">
              {user?.name?.split(" ")[0] || "Perfil"}
            </span>
          </button>

          {/* ✅ Menu dropdown do Perfil */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-primary-light rounded-xl border border-border/50 shadow-lg py-1 z-50 animate-fadeIn">
              <Link
                to="/perfil"
                className="flex items-center gap-3 px-4 py-2.5 text-text hover:bg-accent/10 transition rounded-lg mx-1"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <UserIcon size={18} />
                <span className="text-sm">Meu Perfil</span>
              </Link>
              <div className="border-t border-border/50 my-1" />
              <ConfirmPopup
                trigger={
                  <button className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 transition rounded-lg mx-1 w-full">
                    <SignOutIcon size={18} />
                    <span className="text-sm">Sair</span>
                  </button>
                }
                onConfirm={() => {
                  logout();
                  toast.info("👋 Até logo!");
                  setIsProfileMenuOpen(false);
                  navigate("/");
                }}
                title="Sair da conta"
                message="Tem certeza que deseja sair da sua conta?"
                confirmText="Sair"
                cancelText="Cancelar"
                variant="danger"
                size="sm"
              />
            </div>
          )}
        </div>
      );
    }

    // ✅ Rotas do cliente (não logado)
    if (path === "/servicos") {
      return (
        <button
          className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
          onClick={() => console.log("Buscar serviços")}
        >
          <MagnifyingGlassIcon size={20} />
        </button>
      );
    }

    // ✅ Botão "Entrar" estilizado para usuários não logados
    return (
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium text-primary bg-accent rounded-xl hover:bg-accent-light transition active:scale-[0.97] min-h-[40px] flex items-center justify-center"
      >
        <SignInIcon size={18} className="mr-1.5" />
        Entrar
      </Link>
    );
  };

  // ✅ Não mostra header em rotas de autenticação
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-border/30 px-4 py-3 safe-top">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* ✅ Lado Esquerdo */}
        <div className="flex items-center gap-3 min-w-[44px]">
          {showBack ? (
            <button
              onClick={onBack || (() => window.history.back())}
              className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
            >
              <ArrowLeftIcon size={22} />
            </button>
          ) : leftAction ? (
            leftAction
          ) : (
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <ScissorsIcon size={18} className="text-accent" weight="fill" />
              </div>
              <span className="font-serif text-lg font-bold text-text hidden sm:block">
                Henrique Cortes
              </span>
            </Link>
          )}
        </div>

        {/* ✅ Título Central */}
        <div className="flex-1 text-center overflow-hidden">
          <h1 className="font-serif text-base font-bold text-text truncate">
            {getTitle()}
          </h1>
          {getSubtitle() && (
            <p className="text-[10px] text-text-muted -mt-0.5 truncate">
              {getSubtitle()}
            </p>
          )}
        </div>

        {/* ✅ Lado Direito */}
        <div className="flex items-center gap-2 min-w-[44px] justify-end">
          {getRightAction()}
        </div>
      </div>
    </header>
  );
};
