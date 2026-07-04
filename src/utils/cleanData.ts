/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/cleanData.ts
import type { UpdateProfileData } from "../types";

/**
 * Remove campos vazios, undefined e null de um objeto
 */
export const cleanObject = <T extends Record<string, any>>(
  obj: T,
): Partial<T> => {
  const result: Partial<T> = {};

  Object.entries(obj).forEach(([key, value]) => {
    // ✅ Ignorar valores vazios
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      result[key as keyof T] = value;
    }
  });

  return result;
};

/**
 * Prepara dados do perfil para envio ao backend
 * Alinhado com UpdateProfileDto do backend
 */
export const prepareProfileData = (formData: any): UpdateProfileData => {
  const data: UpdateProfileData = {};

  // ✅ Mapeamento dos campos do formulário para o DTO
  // Todos os campos são opcionais no DTO
  const fields: (keyof UpdateProfileData)[] = [
    "name",
    "email",
    "phone",
    "avatar_url",
    "address",
    "address_number",
    "neighborhood",
    "city",
    "state",
    "zip_code",
    "working_hours",
    "whatsapp",
    "instagram",
    "facebook",
    "google_maps_url",
  ];

  fields.forEach((field) => {
    const value = formData[field];
    // ✅ Incluir apenas se tiver valor
    if (value !== undefined && value !== null && value !== "") {
      // ✅ Tratamentos especiais
      if (field === "state") {
        data[field] = String(value).toUpperCase().trim();
      } else {
        data[field] = String(value).trim();
      }
    }
  });

  return data;
};

/**
 * Valida os dados do perfil antes de enviar
 */
export const validateProfileData = (
  data: UpdateProfileData,
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // ✅ Validar nome (se enviado)
  if (data.name && data.name.length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres");
  }

  // ✅ Validar email (se enviado)
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email inválido");
    }
  }

  // ✅ Validar telefone (se enviado)
  if (data.phone) {
    const phoneClean = data.phone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.push("Telefone deve ter entre 10 e 11 dígitos");
    }
  }

  // ✅ Validar estado (se enviado)
  if (data.state && data.state.length !== 2) {
    errors.push("Estado deve ter 2 caracteres (UF)");
  }

  // ✅ Validar CEP (se enviado)
  if (data.zip_code) {
    const zipClean = data.zip_code.replace(/\D/g, "");
    if (zipClean.length !== 8) {
      errors.push("CEP deve ter 8 dígitos");
    }
  }

  // ✅ Validar WhatsApp (se enviado)
  if (data.whatsapp) {
    const whatsappClean = data.whatsapp.replace(/\D/g, "");
    if (whatsappClean.length < 10 || whatsappClean.length > 13) {
      errors.push("WhatsApp deve ter entre 10 e 13 dígitos");
    }
  }

  return { valid: errors.length === 0, errors };
};
