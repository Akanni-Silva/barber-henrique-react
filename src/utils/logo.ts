// src/utils/logo.ts
import type { BarberPublicInfo } from "../types";

/**
 * Obtém a URL da logo da barbearia
 * @param barberInfo - Informações do barbeiro
 * @returns URL da logo ou null
 */
export const getBarberLogo = (
  barberInfo?: BarberPublicInfo | null,
): string | null => {
  if (barberInfo?.avatar_url) {
    return barberInfo.avatar_url;
  }
  return null;
};

/**
 * Obtém a inicial do nome da barbearia para fallback
 */
export const getBarberInitial = (
  barberInfo?: BarberPublicInfo | null,
): string => {
  if (barberInfo?.name) {
    return barberInfo.name.charAt(0).toUpperCase();
  }
  return "B";
};

/**
 * Obtém o nome da barbearia para exibição
 */
export const getBarberName = (barberInfo?: BarberPublicInfo | null): string => {
  if (barberInfo?.name) {
    return barberInfo.name;
  }
  return "Barbearia";
};
