/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
// src/contexts/BarberInfoContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useApi } from "../hooks/useApi";
import type { BarberPublicInfo } from "../types";

interface BarberInfoContextData {
  barberInfo: BarberPublicInfo | null;
  loading: boolean;
  error: string | null;
  refreshBarberInfo: () => Promise<void>;
}

const BarberInfoContext = createContext<BarberInfoContextData | undefined>(
  undefined,
);

export const BarberInfoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { handleRequest, endpoints } = useApi();
  const [barberInfo, setBarberInfo] = useState<BarberPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarberInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ O endpoint retorna diretamente o PublicProfileDto
      const data = await handleRequest(endpoints.auth.getPublicProfile());
      setBarberInfo(data);
    } catch (err: any) {
      console.error("Erro ao buscar informações do barbeiro:", err);
      setError(
        err?.message || "Não foi possível carregar as informações da barbearia",
      );

      // ✅ Fallback com dados padrão (apenas públicos)
      setBarberInfo({
        name: "Henrique Cortes",
        phone: "(11) 99999-9999",
        address: "Rua Exemplo",
        address_number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zip_code: "01000-000",
        working_hours: "Seg-Sex: 09h-20h • Sáb: 09h-16h",
        whatsapp: "5511999999999",
        instagram: "@henriquecortes",
        avatar_url: null,
        is_active: true,
        google_maps_url: "https://maps.google.com/?q=Rua+Exemplo+123+Sao+Paulo",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarberInfo();
  }, []);

  return (
    <BarberInfoContext.Provider
      value={{
        barberInfo,
        loading,
        error,
        refreshBarberInfo: fetchBarberInfo,
      }}
    >
      {children}
    </BarberInfoContext.Provider>
  );
};

export const useBarberInfo = () => {
  const context = useContext(BarberInfoContext);
  if (context === undefined) {
    throw new Error("useBarberInfo must be used within a BarberInfoProvider");
  }
  return context;
};
