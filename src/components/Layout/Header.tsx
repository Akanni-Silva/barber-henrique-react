/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout/Header.tsx
import React from "react";
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
} from "@phosphor-icons/react";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  return (
    <header className="bg-primary/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <ScissorsIcon
                size={24}
                className="text-primary-dark"
                weight="fill"
              />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-accent leading-tight">
                Henrique Cortes
              </h1>
              <p className="text-[10px] md:text-xs text-text-muted tracking-widest uppercase">
                Barbearia
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!isAuthenticated && (
              <>
                <Link
                  to="/servicos"
                  className={`text-sm transition ${
                    isActive("/servicos")
                      ? "text-accent"
                      : "text-text-secondary hover:text-accent"
                  }`}
                >
                  Serviços
                </Link>
                <Link
                  to="/agendar"
                  className={`text-sm transition ${
                    isActive("/agendar")
                      ? "text-accent"
                      : "text-text-secondary hover:text-accent"
                  }`}
                >
                  Agendar
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-1">
                <span className="w-px h-6 bg-border mx-2"></span>
                {barberLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition ${
                      isActive(link.to)
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-accent hover:bg-primary-light"
                    }`}
                    title={link.label}
                  >
                    <link.icon size={18} />
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <UserIcon size={16} className="text-accent" weight="fill" />
                  </div>
                  <span className="text-sm text-text-secondary hidden lg:inline">
                    {user?.name?.split(" ")[0] || "Barbeiro"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-text-muted hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-500/10"
                  title="Sair"
                >
                  <SignOutIcon size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                <ScissorsIcon size={16} />
                Área do Barbeiro
              </Link>
            )}
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-accent transition p-1.5 rounded-lg hover:bg-primary-light"
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/servicos"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive("/servicos")
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-accent hover:bg-primary-light"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Serviços
                  </Link>
                  <Link
                    to="/agendar"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive("/agendar")
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-accent hover:bg-primary-light"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Agendar
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <div className="border-t border-border my-2 pt-2">
                    <p className="text-xs text-text-muted px-3 py-1">
                      Área do Barbeiro
                    </p>
                  </div>
                  {barberLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        isActive(link.to)
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:text-accent hover:bg-primary-light"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon size={20} />
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2 pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-left"
                    >
                      <SignOutIcon size={20} />
                      Sair
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="btn-primary text-center mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Área do Barbeiro
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
