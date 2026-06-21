// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { Login } from "./pages/Public/Login";
import { Register } from "./pages/Public/Register";
import { Home } from "./pages/Public/Home";
import { ToastConfig } from "./Toast/ToastConfig";
// import { Schedule } from "./pages/Public/Schedule";
// import { Dashboard } from "./pages/Private/Dashboard";

function App() {
  return (
    <AuthProvider>
      <ToastConfig />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-primary-dark">
          <Header />

          {/* ✅ Conteúdo principal com espaçamento SEO-friendly */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/agendar" element={<div>Agendar</div>} />
              <Route path="/servicos" element={<div>Serviços</div>} />

              {/* Rotas de Autenticação */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rotas Protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Dashboard</div>} />
                <Route path="/clientes" element={<div>Clientes</div>} />
                <Route
                  path="/servicos-admin"
                  element={<div>Serviços Admin</div>}
                />
                <Route path="/agenda" element={<div>Agenda</div>} />
                <Route path="/agendamentos" element={<div>Agendamentos</div>} />
              </Route>

              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
