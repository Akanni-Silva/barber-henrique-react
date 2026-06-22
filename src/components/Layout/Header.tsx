// src/components/Layout/Header.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  ListIcon,
  ScissorsIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-primary/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      {/* ✅ Adicionar container com padding responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/agendar"
              className="text-text-secondary hover:text-accent transition"
            >
              Agendar
            </Link>
            <Link
              to="/servicos"
              className="text-text-secondary hover:text-accent transition"
            >
              Serviços
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-text-secondary hover:text-accent transition"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-text-muted">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-text-muted hover:text-red-500 transition"
                  >
                    <SignOutIcon size={20} />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Área do Barbeiro
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-accent transition"
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              <Link
                to="/agendar"
                className="text-text-secondary hover:text-accent transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agendar
              </Link>
              <Link
                to="/servicos"
                className="text-text-secondary hover:text-accent transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Serviços
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-text-secondary hover:text-accent transition py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-500 hover:text-red-400 transition py-2 text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary text-center"
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
