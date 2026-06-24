// src/utils/formatDate.ts
export const formatDate = (date: string | Date): string => {
  // Se for string, pega a data diretamente sem converter para UTC
  if (typeof date === "string") {
    // Divide a string da data (YYYY-MM-DD) e cria a data no horário local
    const parts = date.split("T")[0].split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
  }

  // Se for Date, usa o método local
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Função para formatar hora (já que appointment_time é string)
export const formatTime = (time: string): string => {
  // Se for string no formato "HH:MM:SS" ou "HH:MM"
  return time.substring(0, 5);
};
