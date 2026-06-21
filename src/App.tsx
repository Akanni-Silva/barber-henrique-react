// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

import { Login } from "./pages/Public/Login";
import { ToastConfig } from "./Toast/ToastConfig";


// Importar outras páginas conforme forem criadas
// import { Clients } from './pages/Private/Clients';
// import { Products } from './pages/Private/Products';
// import { Schedule } from './pages/Public/Schedule';

function App() {
  return (
    <AuthProvider>
      <ToastConfig />
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/agendar" element={<div>Página de Agendamento</div>} />

          {/* Rotas Privadas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/clientes" element={<div>Clientes</div>} />
            <Route path="/servicos" element={<div>Serviços</div>} />
            <Route path="/agenda" element={<div>Agenda</div>} />
            <Route path="/agendamentos" element={<div>Agendamentos</div>} />
          </Route>

          {/* Redirecionamento */}
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
