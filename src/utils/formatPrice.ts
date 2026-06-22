/**
 * Formata um valor numérico para o padrão de moeda brasileira (R$)
 * @param value - Valor a ser formatado (número ou string numérica)
 * @returns String formatada no padrão R$ X.XXX,XX
 *
 * @example
 * formatPrice(45.5) // "R$ 45,50"
 * formatPrice(1000) // "R$ 1.000,00"
 * formatPrice("70") // "R$ 70,00"
 */
export const formatPrice = (value: number | string): string => {
  // Converte para número e garante duas casas decimais
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Verifica se é um número válido
  if (isNaN(numericValue)) {
    return "R$ 0,00";
  }

  // Formata no padrão brasileiro
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};
