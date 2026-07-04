// src/utils/validators.ts
/**
 * Valida um número de telefone/WhatsApp
 * @param phone - Número de telefone
 * @returns true se o número for válido
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "");

  // Verifica se tem entre 10 e 13 dígitos (com ou sem código do país)
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
};

/**
 * Formata um número de telefone para exibição
 * @param phone - Número de telefone
 * @returns Número formatado
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";

  const cleanPhone = phone.replace(/\D/g, "");

  // Formato: (XX) XXXXX-XXXX
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }

  // Formato: (XX) XXXX-XXXX
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }

  // Formato internacional: +XX XXXXXXXXXX
  if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
    return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 4)} ${cleanPhone.slice(4, 9)}-${cleanPhone.slice(9)}`;
  }

  return phone;
};

/**
 * Valida se o telefone é um WhatsApp válido
 * @param phone - Número de telefone
 * @returns true se for um WhatsApp válido
 */
export const isValidWhatsApp = (phone: string): boolean => {
  if (!phone) return false;

  const cleanPhone = phone.replace(/\D/g, "");

  // WhatsApp geralmente tem 10-11 dígitos (com DDD)
  // Ou 12-13 dígitos (com código do país + DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
};
