// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { ToastConfig } from "./Toast/ToastConfig";

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

function App() {
  return (
    <AuthProvider>
      <ToastConfig />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-primary">
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <Routes>
              {/* ✅ Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ✅ Rota de Agendamento (apenas para DESLOGADOS) */}
              <Route
                element={
                  <ProtectedRoute requireGuest redirectTo="/dashboard" />
                }
              >
                <Route path="/agendar" element={<Schedule />} />
              </Route>

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

              {/* ✅ Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
