// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { ToastConfig } from "./Toast/ToastConfig";
import { useLocation } from "react-router-dom";

// Páginas Públicas
import { Home } from "./pages/Public/Home";
import { Login } from "./pages/Public/Login";
import { Register } from "./pages/Public/Register";
import { Schedule } from "./pages/Public/Schedule";
import { Services } from "./pages/Public/Services";

// Páginas Privadas
import { Dashboard } from "./pages/Private/Dashboard";
import { Clients } from "./pages/Private/Clients";
import { Products } from "./pages/Private/Products";
import { ScheduleManagement } from "./pages/Private/ScheduleManagement";
import { AppointmentsManagement } from "./pages/Private/AppointmentsManagement";

// ✅ Componente de Layout que decide quando mostrar Header/Footer
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // ✅ Rotas de autenticação (sem header/footer)
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  // ✅ Rotas públicas que devem ter header/footer
  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/servicos" ||
    location.pathname === "/agendar";

  // ✅ Rotas privadas (com header/footer)
  const isPrivateRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/clientes") ||
    location.pathname.startsWith("/servicos-admin") ||
    location.pathname.startsWith("/agenda") ||
    location.pathname.startsWith("/agendamentos");

  // ✅ Determinar se deve mostrar header e footer
  const showHeaderFooter =
    isPublicRoute || isPrivateRoute || location.pathname === "/agendar";
  const showHeader = showHeaderFooter && !isAuthRoute;
  const showFooter = showHeaderFooter && !isAuthRoute;

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {showHeader && <Header />}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          showHeader ? "py-4 sm:py-6 md:py-8" : "py-0"
        } ${isAuthRoute ? "flex items-center justify-center" : ""}`}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* ✅ Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/servicos" element={<Services />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Rota de Agendamento (apenas para DESLOGADOS) */}
      <Route element={<ProtectedRoute requireGuest redirectTo="/dashboard" />}>
        <Route path="/agendar" element={<Schedule />} />
      </Route>

      {/* ✅ Rotas Protegidas (apenas LOGADOS) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/servicos-admin" element={<Products />} />
        <Route path="/agenda" element={<ScheduleManagement />} />
        <Route path="/agendamentos" element={<AppointmentsManagement />} />
      </Route>

      {/* ✅ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastConfig />
      <BrowserRouter>
        <AppLayout>
          <AppContent />
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
