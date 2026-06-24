// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { Login } from "./pages/Public/Login";
import { Register } from "./pages/Public/Register";
import { Home } from "./pages/Public/Home";
import { Schedule } from "./pages/Public/Schedule";
import { Services } from "./pages/Public/Services";
import { Dashboard } from "./pages/Private/Dashboard";
import { Clients } from "./pages/Private/Clients";
import { Products } from "./pages/Private/Products";
import { ScheduleManagement } from "./pages/Private/ScheduleManagement";
import { AppointmentsManagement } from "./pages/Private/AppointmentsManagement";
import { ToastConfig } from "./Toast/ToastConfig";

function App() {
  return (
    <AuthProvider>
      <ToastConfig />
      <BrowserRouter>
        <Header />
        <div className="min-h-[80vh] max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12">
          <Routes>
            {/* ✅ Rotas Públicas (acessíveis para todos) */}
            <Route path="/" element={<Home />} />
            <Route path="/servicos" element={<Services />} />

            {/* ✅ Rota de Agendamento (apenas para DESLOGADOS) */}
            <Route
              element={<ProtectedRoute requireGuest redirectTo="/dashboard" />}
            >
              <Route path="/agendar" element={<Schedule />} />
            </Route>

            {/* Rotas de Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ✅ Rotas Protegidas (apenas LOGADOS) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/servicos-admin" element={<Products />} />
              <Route path="/agenda" element={<ScheduleManagement />} />
              <Route
                path="/agendamentos"
                element={<AppointmentsManagement />}
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
