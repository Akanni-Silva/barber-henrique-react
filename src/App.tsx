// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext";
import { ServiceProvider } from "./contexts/ServiceContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { BottomNav } from "./components/Layout/BottomNav";
import { ScrollToTop } from "./components/Common/ScrollToTop";
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
import { MobileHeader } from "./components/Layout/MobileHeader";
import { Perfil } from "./pages/Private/Perfil";
import ClientHistory from "./pages/Private/ClientHistory";
import { BarberInfoProvider } from "./contexts/BarberInfoContext";

function AppContent() {
  const location = useLocation();

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  const showBottomNav = !isAuthRoute;

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <MobileHeader />
      <main
        className={`flex-1 w-full mx-auto px-4 pb-20 ${
          isAuthRoute ? "flex items-center justify-center" : "pt-4"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={<ProtectedRoute requireGuest redirectTo="/dashboard" />}
          >
            <Route path="/agendar" element={<Schedule />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/clientes/:id/historico" element={<ClientHistory />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/servicos-admin" element={<Products />} />
            <Route path="/agenda" element={<ScheduleManagement />} />
            <Route path="/agendamentos" element={<AppointmentsManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BarberInfoProvider>
      <AuthProvider>
        <FilterProvider>
          <ServiceProvider>
            <ToastConfig />
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </ServiceProvider>
        </FilterProvider>
      </AuthProvider>
    </BarberInfoProvider>
  );
}

export default App;
