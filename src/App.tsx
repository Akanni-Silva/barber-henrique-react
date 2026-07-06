// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext";
import { ServiceProvider } from "./contexts/ServiceContext";
import { BarberInfoProvider } from "./contexts/BarberInfoContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";

// Pages
import { Home } from "./pages/Public/Home";
import { Services } from "./pages/Public/Services";
import { Schedule } from "./pages/Public/Schedule";
import { Login } from "./pages/Public/Login";
import { Register } from "./pages/Public/Register";
import { ResetPassword } from "./pages/Public/ResetPassword";
import { Dashboard } from "./pages/Private/Dashboard";
import { AppointmentsManagement } from "./pages/Private/AppointmentsManagement";
import { Clients } from "./pages/Private/Clients";
import { Products } from "./pages/Private/Products";
import { ScheduleManagement } from "./pages/Private/ScheduleManagement";
import { Perfil } from "./pages/Private/Perfil";
import { ClientHistory } from "./pages/Private/ClientHistory";

import "react-toastify/dist/ReactToastify.css";
import { ScrollToTop } from "./components/Common/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
          <ServiceProvider>
            <BarberInfoProvider>
              <ScrollToTop />
              <Routes>
                {/* ✅ Rotas Públicas (sem layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ✅ Rotas com Layout (AppLayout) */}
                <Route element={<AppLayout />}>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="/agendar" element={<Schedule />} />

                  {/* Rotas Protegidas (Barbeiro) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/agendamentos"
                      element={<AppointmentsManagement />}
                    />
                    <Route path="/clientes" element={<Clients />} />
                    <Route
                      path="/clientes/:id/historico"
                      element={<ClientHistory />}
                    />
                    <Route path="/servicos-admin" element={<Products />} />
                    <Route path="/agenda" element={<ScheduleManagement />} />
                    <Route path="/perfil" element={<Perfil />} />
                  </Route>
                </Route>
              </Routes>
              <ToastContainer position="bottom-center" theme="dark" />
            </BarberInfoProvider>
          </ServiceProvider>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
