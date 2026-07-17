/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout/AppLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { DesktopHeader } from "./DesktopHeader";
import { DesktopFooter } from "./DesktopFooter";

export const AppLayout = () => {
  useAuth();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Não mostrar layout em rotas de autenticação
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-primary">
      {isDesktop ? (
        // ✅ Desktop - Layout com Sidebar + Header + Footer (footer no final)
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <DesktopHeader />
            {/* ✅ Main com flex-1 para empurrar o footer para baixo */}
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
            <DesktopFooter />
          </div>
        </div>
      ) : (
        // ✅ Mobile/Tablet - Layout atual
        <div className="flex flex-col min-h-screen">
          <MobileHeader />
          <main className="flex-1 px-4 py-4 pb-20">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          <BottomNav />
        </div>
      )}
    </div>
  );
};
