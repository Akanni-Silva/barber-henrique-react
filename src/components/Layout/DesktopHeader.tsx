/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout/DesktopHeader.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ScissorsIcon,
  BellIcon,
  UserIcon,
  SignOutIcon,
  XIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import { useBarberInfo } from "../../contexts/BarberInfoContext";
import { ConfirmPopup } from "../Common/ConfirmPopup";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import {
  getBarberLogo,
  getBarberInitial,
  getBarberName,
} from "../../utils/logo";
import { useApi } from "../../hooks/useApi";
import { useLogout } from "../../hooks/useLogout";

interface Notification {
  id: number;
  type: "new_appointment" | "reminder" | "cancellation" | "confirmation";
  message: string;
  date: string;
  read: boolean;
  appointmentId?: number;
}

export const DesktopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { barberInfo } = useBarberInfo();
  const { endpoints, handleRequest } = useApi();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Buscar notificações
  useEffect(() => {
    if (isAuthenticated) {
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

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) return null;
  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { logout } = useLogout({
    redirectTo: "/",
    showToast: true,
  });

  const logoUrl = getBarberLogo(barberInfo);
  const initial = getBarberInitial(barberInfo);
  const barberName = getBarberName(barberInfo);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_appointment":
        return <CalendarIcon size={16} className="text-accent" />;
      case "reminder":
        return <ClockIcon size={16} className="text-yellow-500" />;
      case "confirmation":
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case "cancellation":
        return <XIcon size={16} className="text-red-500" />;
      default:
        return <BellIcon size={16} className="text-text-muted" />;
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

  return (
    <header className="bg-primary-light/80 backdrop-blur-sm border-b border-border/30 px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* ✅ Lado Esquerdo - Breadcrumb (apenas logado) */}
      <div className="flex items-center gap-4 min-w-[120px]">
        {isAuthenticated && (
          <span className="text-text-muted text-xs font-medium">
            {location.pathname === "/" && "Início"}
            {location.pathname === "/servicos" && "Serviços"}
            {location.pathname === "/agendar" && "Agendamento"}
            {location.pathname === "/dashboard" && "Dashboard"}
            {location.pathname === "/agendamentos" && "Agendamentos"}
            {location.pathname === "/clientes" && "Clientes"}
            {location.pathname === "/servicos-admin" && "Serviços"}
            {location.pathname === "/agenda" && "Agenda"}
            {location.pathname === "/perfil" && "Perfil"}
          </span>
        )}
      </div>

      {/* ✅ Centro - Logo + Nome (apenas não logado) - SEM ABSOLUTE */}
      {!isAuthenticated && (
        <div className="flex-1 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center border-2 border-accent/20 shadow-glow-sm">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={barberName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-accent font-serif text-xl font-bold">
                {initial}
              </span>
            )}
          </div>
          <span className="text-text-muted/60 text-[11px] font-medium tracking-[0.15em] uppercase mt-2 leading-none">
            {barberName}
          </span>
        </div>
      )}

      {/* ✅ Lado Direito */}
      <div className="flex items-center gap-4 min-w-[120px] justify-end">
        {/* Notificações (apenas logado) */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="text-text-muted hover:text-accent transition p-1.5 rounded-lg hover:bg-accent/10 relative"
              title="Notificações"
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] bg-primary-light rounded-xl border border-border/50 shadow-lg overflow-hidden z-50 animate-fadeIn">
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <h4 className="font-semibold text-text text-sm">
                    Notificações
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-accent text-xs hover:text-accent-light transition font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[320px]">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔔</div>
                      <p className="text-text-muted text-sm">
                        Nenhuma notificação
                      </p>
                      <p className="text-text-muted text-xs mt-1">
                        Você está em dia!
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
                            <p className="text-text text-sm font-medium break-words">
                              {notification.message}
                            </p>
                            <p className="text-text-muted text-xs mt-0.5">
                              {new Date(notification.date).toLocaleString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-border/50">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate("/agendamentos");
                      }}
                      className="w-full text-center text-text-muted hover:text-accent transition text-xs font-medium py-1"
                    >
                      Ver todos os agendamentos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Perfil (apenas logado) */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 hover:bg-accent/5 rounded-xl px-3 py-1.5 transition"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center border border-accent/20">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={16} className="text-accent" weight="fill" />
                )}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-text text-sm font-medium leading-tight">
                  {user.name?.split(" ")[0] || "Barbeiro"}
                </p>
                <p className="text-text-muted text-xs leading-tight">
                  {user.email}
                </p>
              </div>
              <span className="text-text-muted text-xs">▼</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-primary-light rounded-xl border border-border/50 shadow-lg py-1.5 z-50 animate-fadeIn">
                <Link
                  to="/perfil"
                  className="flex items-center gap-3 px-4 py-2.5 text-text hover:bg-accent/10 transition rounded-lg mx-1"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <UserIcon size={18} />
                  <span className="text-sm">Meu Perfil</span>
                </Link>
                <div className="border-t border-border/50 my-1.5 mx-3" />
                <ConfirmPopup
                  trigger={
                    <button className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 transition rounded-lg mx-1 w-full">
                      <SignOutIcon size={18} />
                      <span className="text-sm">Sair da conta</span>
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
            )}
          </div>
        ) : (
          // ✅ Placeholder para alinhamento (apenas não logado)
          <div className="w-8 h-8" />
        )}
      </div>
    </header>
  );
};
