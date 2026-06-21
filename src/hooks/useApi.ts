/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useApi.ts
import { useState, useCallback } from "react";
import { authEndpoint } from "../api/endpoints/auth";
import { clientsEndpoint } from "../api/endpoints/clients";
import { productsEndpoint } from "../api/endpoints/products";
import { scheduleEndpoint } from "../api/endpoints/schedule";
import { appointmentsEndpoint } from "../api/endpoints/appointments";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async (request: Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await request;
      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Erro na requisição";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    handleRequest,
    endpoints: {
      auth: authEndpoint,
      clients: clientsEndpoint,
      products: productsEndpoint,
      schedule: scheduleEndpoint,
      appointments: appointmentsEndpoint,
    },
  };
};
