/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  ListIcon,
  ScissorsIcon,
  SignOutIcon,
  XIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  HouseIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@phosphor-icons/react";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Detectar scroll para efeito de sombra
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const barberLinks = [
    { to: "/dashboard", label: "Dashboard", icon: HouseIcon },
    { to: "/agendamentos", label: "Agendamentos", icon: ClipboardIcon },
    { to: "/clientes", label: "Clientes", icon: UserIcon },
    { to: "/servicos-admin", label: "Serviços", icon: ScissorsIcon },
    { to: "/agenda", label: "Agenda", icon: ClockIcon },
  ];

  // ✅ Fechar menu ao mudar de rota
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${
          isScrolled
            ? "bg-primary/95 backdrop-blur-lg shadow-lg border-b border-border/50"
            : "bg-primary/90 backdrop-blur-sm border-b border-border/30"
        }
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[72px]">
          {/* ✅ Logo com efeito glow */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-accent rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-glow">
                <ScissorsIcon
                  size={22}
                  className="text-primary-dark"
                  weight="fill"
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-accent leading-tight">
                Henrique Cortes
              </h1>
              <p className="text-[10px] md:text-xs text-text-muted tracking-[0.15em] uppercase">
                ✂️ Barbearia Premium
              </p>
            </div>
          </Link>

          {/* ✅ Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated && (
              <>
                <Link
                  to="/servicos"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/servicos")
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:text-accent hover:bg-accent/5"
                  }`}
                >
                  Serviços
                </Link>
                <Link
                  to="/agendar"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/agendar")
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:text-accent hover:bg-accent/5"
                  }`}
                >
                  Agendar
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-1 ml-2">
                {barberLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.to)
                        ? "bg-accent/10 text-accent shadow-glow-sm"
                        : "text-text-secondary hover:text-accent hover:bg-accent/5"
                    }`}
                    title={link.label}
                  >
                    <link.icon size={18} />
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* ✅ Avatar e Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border/50">
                <button
                  className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5 relative"
                  aria-label="Notificações"
                >
                  <BellIcon size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <div className="flex items-center gap-2 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/10">
                    <UserIcon size={16} className="text-accent" weight="fill" />
                  </div>
                  <span className="text-sm text-text-secondary hidden lg:inline group-hover:text-accent transition">
                    {user?.name?.split(" ")[0] || "Barbeiro"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-red-500 transition rounded-xl hover:bg-red-500/10"
                  title="Sair"
                >
                  <SignOutIcon size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 btn-primary text-sm py-2.5 px-5 flex items-center gap-2 rounded-xl font-medium"
              >
                <ScissorsIcon size={16} />
                Área do Barbeiro
              </Link>
            )}
          </nav>

          {/* ✅ Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-accent transition p-2 rounded-xl hover:bg-accent/5"
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
          </button>
        </div>

        {/* ✅ Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slideDown">
            <nav className="flex flex-col gap-1">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/servicos"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive("/servicos")
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-accent hover:bg-accent/5"
                    }`}
                  >
                    <MagnifyingGlassIcon size={20} />
                    Serviços
                  </Link>
                  <Link
                    to="/agendar"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive("/agendar")
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-accent hover:bg-accent/5"
                    }`}
                  >
                    <CalendarIcon size={20} />
                    Agendar
                  </Link>
                  <div className="border-t border-border/50 my-2 pt-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl btn-primary justify-center"
                    >
                      <ScissorsIcon size={20} />
                      Área do Barbeiro
                    </Link>
                  </div>
                </>
              )}

              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/10">
                      <UserIcon
                        size={20}
                        className="text-accent"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <p className="text-text font-semibold">
                        {user?.name || "Barbeiro"}
                      </p>
                      <p className="text-text-muted text-xs">{user?.email}</p>
                    </div>
                  </div>

                  <div className="pt-1">
                    {barberLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive(link.to)
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:text-accent hover:bg-accent/5"
                        }`}
                      >
                        <link.icon size={20} />
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/50 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                      <SignOutIcon size={20} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
