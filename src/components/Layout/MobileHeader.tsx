/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Layout/MobileHeader.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ScissorsIcon,
  BellIcon,
  UserIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  SignOutIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import { useFilter } from "../../contexts/FilterContext";
import { useService } from "../../contexts/ServiceContext";
import { ConfirmPopup } from "../Common/ConfirmPopup";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useBarberInfo } from "../../contexts/BarberInfoContext";
import { getBarberLogo, getBarberName } from "../../utils/logo";
import { useApi } from "../../hooks/useApi";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

interface Notification {
  id: number;
  type: "new_appointment" | "reminder" | "cancellation" | "confirmation";
  message: string;
  date: string;
  read: boolean;
  appointmentId?: number;
}

export const MobileHeader = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  leftAction,
}: MobileHeaderProps) => {
  const { barberInfo } = useBarberInfo();
  const { endpoints, handleRequest } = useApi();
  const logoUrl = getBarberLogo(barberInfo);
  const barberName = getBarberName(barberInfo);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleFilters } = useFilter();
  const { openServiceModal } = useService();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Buscar notificações
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/immutability
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const [todayData, upcomingData] = await Promise.all([
        handleRequest(endpoints.appointments.findToday()),
        handleRequest(endpoints.appointments.findUpcoming(5)),
      ]);

      const todayList = Array.isArray(todayData)
        ? todayData
        : todayData?.appointments || [];
      const upcomingList = Array.isArray(upcomingData)
        ? upcomingData
        : upcomingData?.appointments || [];

      const notificationsList: Notification[] = [];

      todayList.forEach((app: any) => {
        const time = new Date(
          app.appointment_date + "T" + app.appointment_time,
        );
        const now = new Date();
        const diffMinutes = (time.getTime() - now.getTime()) / 60000;

        let type: Notification["type"] = "reminder";
        let message = "";
        let read = false;

        if (diffMinutes < 0 && app.status === "pending") {
          type = "reminder";
          message = `⚠️ Agendamento de ${app.client?.name || "cliente"} está atrasado`;
          read = false;
        } else if (
          diffMinutes <= 30 &&
          diffMinutes > 0 &&
          app.status === "pending"
        ) {
          type = "reminder";
          message = `🔔 ${app.client?.name || "Cliente"} chega em ${Math.round(diffMinutes)}min`;
          read = false;
        } else if (
          app.status === "confirmed" &&
          diffMinutes < 0 &&
          diffMinutes > -60
        ) {
          type = "reminder";
          message = `⏳ Atendimento de ${app.client?.name || "cliente"} em andamento`;
          read = false;
        }

        if (message) {
          notificationsList.push({
            id: app.id,
            type,
            message,
            date: app.appointment_date + " " + app.appointment_time,
            read,
            appointmentId: app.id,
          });
        }
      });

      upcomingList.forEach((app: any) => {
        if (app.status === "confirmed" || app.status === "pending") {
          notificationsList.push({
            id: app.id + 1000,
            type: "new_appointment",
            message: `📅 ${app.client?.name || "Cliente"} agendado para ${new Date(app.appointment_date).toLocaleDateString("pt-BR")} às ${app.appointment_time}`,
            date: app.appointment_date + " " + app.appointment_time,
            read: false,
            appointmentId: app.id,
          });
        }
      });

      notificationsList.sort((a, b) => {
        if (a.read && !b.read) return 1;
        if (!a.read && b.read) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      const limitedNotifications = notificationsList.slice(0, 10);
      setNotifications(limitedNotifications);
      setUnreadCount(limitedNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_appointment":
        return <CalendarIcon size={14} className="text-accent" />;
      case "reminder":
        return <ClockIcon size={14} className="text-yellow-500" />;
      case "confirmation":
        return <CheckCircleIcon size={14} className="text-green-500" />;
      case "cancellation":
        return <XIcon size={14} className="text-red-500" />;
      default:
        return <BellIcon size={14} className="text-text-muted" />;
    }
  };

  const getNotificationBg = (type: Notification["type"]) => {
    switch (type) {
      case "new_appointment":
        return "bg-accent/5 border-accent/20";
      case "reminder":
        return "bg-yellow-500/5 border-yellow-500/20";
      case "confirmation":
        return "bg-green-500/5 border-green-500/20";
      case "cancellation":
        return "bg-red-500/5 border-red-500/20";
      default:
        return "bg-primary/50 border-border/50";
    }
  };

  // ✅ Detectar mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Se for desktop, não mostrar o header
  if (isDesktop) {
    return null;
  }

  const getTitle = () => {
    if (title) return title;

    const path = location.pathname;
    const titles: Record<string, string> = {
      "/": barberName,
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
    return titles[path] || barberName;
  };

  const getSubtitle = () => {
    const path = location.pathname;

    if (isAuthenticated) {
      if (path === "/dashboard")
        return `Olá, ${user?.name?.split(" ")[0] || "Barbeiro"}`;
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

  const getRightAction = () => {
    if (rightAction) return rightAction;

    const path = location.pathname;

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

    return null;
  };

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
          ) : isAuthenticated ? (
            // ✅ Quando logado: botão de notificações no lugar da logo
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10 relative"
                title="Notificações"
              >
                <BellIcon size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* ✅ Dropdown de Notificações Mobile */}
              {isNotificationOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 max-h-[350px] bg-primary-light rounded-xl border border-border/50 shadow-lg overflow-hidden z-50 animate-fadeIn">
                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <h4 className="font-semibold text-text text-sm">
                      Notificações
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-accent text-xs hover:text-accent-light transition font-medium"
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[280px]">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className="text-text-muted text-sm">
                          Nenhuma notificação
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-border/30 hover:bg-primary transition cursor-pointer ${!notification.read ? "bg-accent/5" : ""}`}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.appointmentId) {
                              navigate(
                                `/agendamentos?appointment=${notification.appointmentId}`,
                              );
                              setIsNotificationOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationBg(notification.type)}`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-text text-xs font-medium break-words">
                                {notification.message}
                              </p>
                              <p className="text-text-muted text-[10px] mt-0.5">
                                {new Date(notification.date).toLocaleString(
                                  "pt-BR",
                                )}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ✅ Quando não logado: logo
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center overflow-hidden border border-accent/20">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={barberName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ScissorsIcon
                    size={18}
                    className="text-accent"
                    weight="fill"
                  />
                )}
              </div>
              <span className="font-serif text-lg font-bold text-text hidden sm:block">
                {barberName}
              </span>
            </Link>
          )}
        </div>

        {/* Título Central */}
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

        {/* Lado Direito */}
        <div className="flex items-center gap-2 min-w-[44px] justify-end">
          {getRightAction()}
        </div>
      </div>
    </header>
  );
};
