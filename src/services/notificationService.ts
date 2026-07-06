// src/services/notificationService.ts
import { whatsappService } from "./whatsappService";
import type { Appointment, Product, User, NotificationData } from "../types";
import { formatDate } from "../utils/formatDate";
import { formatPrice } from "../utils/formatPrice";

class NotificationService {
  // ✅ Notificar barbeiro sobre novo agendamento
  async notifyBarberNewAppointment(data: NotificationData): Promise<boolean> {
    const { appointment, service, barber } = data;

    const message = this.buildBarberNewAppointmentMessage(
      appointment,
      service,
      barber,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: barber.phone || "",
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar cliente sobre novo agendamento
  async notifyClientNewAppointment(data: NotificationData): Promise<boolean> {
    const { appointment, service, client } = data;

    if (!client?.phone) {
      console.warn(
        "⚠️ Cliente sem telefone, não é possível enviar notificação",
      );
      return false;
    }

    const message = this.buildClientNewAppointmentMessage(
      appointment,
      service,
      client,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: client.phone,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar barbeiro sobre confirmação
  async notifyBarberConfirmation(data: NotificationData): Promise<boolean> {
    const { appointment, service, barber } = data;

    const message = this.buildBarberConfirmationMessage(
      appointment,
      service,
      barber,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: barber.phone || "",
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar cliente sobre confirmação
  async notifyClientConfirmation(data: NotificationData): Promise<boolean> {
    const { appointment, service, client } = data;

    if (!client?.phone) {
      console.warn("⚠️ Cliente sem telefone");
      return false;
    }

    const message = this.buildClientConfirmationMessage(
      appointment,
      service,
      client,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: client.phone,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar barbeiro sobre cancelamento
  async notifyBarberCancellation(data: NotificationData): Promise<boolean> {
    const { appointment, barber } = data;

    const message = this.buildBarberCancellationMessage(appointment, barber);

    try {
      const result = await whatsappService.sendMessage({
        to: barber.phone || "",
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar cliente sobre cancelamento
  async notifyClientCancellation(data: NotificationData): Promise<boolean> {
    const { appointment, client } = data;

    if (!client?.phone) {
      console.warn("⚠️ Cliente sem telefone");
      return false;
    }

    const message = this.buildClientCancellationMessage(appointment, client);

    try {
      const result = await whatsappService.sendMessage({
        to: client.phone,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar barbeiro sobre reagendamento
  async notifyBarberReschedule(data: NotificationData): Promise<boolean> {
    const { appointment, service, barber } = data;

    const message = this.buildBarberRescheduleMessage(
      appointment,
      service,
      barber,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: barber.phone || "",
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar cliente sobre reagendamento
  async notifyClientReschedule(data: NotificationData): Promise<boolean> {
    const { appointment, service, client } = data;

    if (!client?.phone) {
      console.warn("⚠️ Cliente sem telefone");
      return false;
    }

    const message = this.buildClientRescheduleMessage(
      appointment,
      service,
      client,
    );

    try {
      const result = await whatsappService.sendMessage({
        to: client.phone,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar cliente sobre lembrete
  async notifyClientReminder(
    appointment: Appointment,
    client: User,
  ): Promise<boolean> {
    if (!client?.phone) {
      console.warn("⚠️ Cliente sem telefone");
      return false;
    }

    const message = this.buildClientReminderMessage(appointment, client);

    try {
      const result = await whatsappService.sendMessage({
        to: client.phone,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Notificar barbeiro sobre lembrete diário
  async notifyBarberDailyReminder(
    appointments: Appointment[],
    barber: User,
  ): Promise<boolean> {
    if (appointments.length === 0) {
      return false;
    }

    const message = this.buildBarberDailyReminderMessage(appointments, barber);

    try {
      const result = await whatsappService.sendMessage({
        to: barber.phone || "",
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  }

  // ✅ Método para enviar mensagem personalizada
  async sendCustomMessage(to: string, message: string): Promise<boolean> {
    try {
      const result = await whatsappService.sendMessage({
        to,
        message,
        type: "text",
      });

      return result.success;
    } catch (error) {
      console.error("Erro ao enviar mensagem personalizada:", error);
      return false;
    }
  }

  // ✅ Construir mensagens para o barbeiro
  private buildBarberNewAppointmentMessage(
    appointment: Appointment,
    service?: Product,
    barber?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const clientName = appointment.client?.name || "Cliente";
    const serviceName = service?.name || appointment.service?.name || "Serviço";
    const price = service?.price || appointment.service?.price || 0;

    return `🔔 *NOVO AGENDAMENTO* 🔔

Olá ${barber?.name?.split(" ")[0] || "Barbeiro"}! Um novo cliente agendou um horário:

👤 *Cliente:* ${clientName}
📅 *Data:* ${date}
⏰ *Horário:* ${time}
✂️ *Serviço:* ${serviceName}
💰 *Valor:* ${formatPrice(price)}

ℹ️ *Status:* Pendente de confirmação

Acesse o sistema para confirmar ou reagendar.`;
  }

  private buildBarberConfirmationMessage(
    appointment: Appointment,
    service?: Product,
    barber?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const clientName = appointment.client?.name || "Cliente";
    const serviceName = service?.name || appointment.service?.name || "Serviço";

    return `✅ *CONFIRMAÇÃO* ✅

Olá ${barber?.name?.split(" ")[0] || "Barbeiro"}! O agendamento foi confirmado:

👤 Cliente: ${clientName}
📅 Data: ${date}
⏰ Horário: ${time}
✂️ Serviço: ${serviceName}

✅ *Status:* Confirmado

Aguardando atendimento.`;
  }

  private buildBarberCancellationMessage(
    appointment: Appointment,
    barber?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const clientName = appointment.client?.name || "Cliente";

    return `❌ *CANCELAMENTO* ❌

Olá ${barber?.name?.split(" ")[0] || "Barbeiro"}! O agendamento foi cancelado:

👤 Cliente: ${clientName}
📅 Data: ${date}
⏰ Horário: ${time}

ℹ️ O horário ficou disponível para novos agendamentos.`;
  }

  private buildBarberRescheduleMessage(
    appointment: Appointment,
    service?: Product,
    barber?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const clientName = appointment.client?.name || "Cliente";
    const serviceName = service?.name || appointment.service?.name || "Serviço";

    return `📅 *REAGENDAMENTO* 📅

Olá ${barber?.name?.split(" ")[0] || "Barbeiro"}! O cliente *${clientName}* reagendou:

🔄 *Novo horário:*
📅 Data: ${date}
⏰ Horário: ${time}
✂️ Serviço: ${serviceName}

✅ *Status:* Pendente de confirmação

Acesse o sistema para confirmar.`;
  }

  private buildBarberDailyReminderMessage(
    appointments: Appointment[],
    barber?: User,
  ): string {
    const today = formatDate(new Date().toISOString());
    const total = appointments.length;

    let message = `📋 *LEMBRETE DIÁRIO* 📋

Olá ${barber?.name?.split(" ")[0] || "Barbeiro"}! Hoje (${today}) você tem ${total} agendamento(s):

`;

    appointments.forEach((app, index) => {
      const clientName = app.client?.name || "Cliente";
      const time = app.appointment_time;
      const status =
        app.status === "confirmed" ? "✅ Confirmado" : "⏳ Pendente";
      message += `${index + 1}. ${clientName} - ${time} (${status})\n`;
    });

    message += `\nBom trabalho! 💪`;

    return message;
  }

  // ✅ Construir mensagens para o cliente
  private buildClientNewAppointmentMessage(
    appointment: Appointment,
    service?: Product,
    client?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const serviceName = service?.name || appointment.service?.name || "Serviço";
    const price = service?.price || appointment.service?.price || 0;
    const barberName = "Barbeiro"; // Nome do barbeiro

    return `✅ *AGENDAMENTO REALIZADO* ✅

Olá ${client?.name?.split(" ")[0] || "Cliente"}! Seu agendamento foi recebido:

✂️ *Serviço:* ${serviceName}
💰 *Valor:* ${formatPrice(price)}
👤 *Barbeiro:* ${barberName}
📅 *Data:* ${date}
⏰ *Horário:* ${time}

ℹ️ *Status:* Aguardando confirmação

Aguardamos a confirmação do barbeiro. Você receberá uma notificação em breve.

Obrigado pela preferência! ✂️`;
  }

  private buildClientConfirmationMessage(
    appointment: Appointment,
    service?: Product,
    client?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const serviceName = service?.name || appointment.service?.name || "Serviço";
    const barberName = "Barbeiro";

    return `✅ *AGENDAMENTO CONFIRMADO* ✅

Olá ${client?.name?.split(" ")[0] || "Cliente"}! Seu agendamento foi confirmado:

✂️ *Serviço:* ${serviceName}
👤 *Barbeiro:* ${barberName}
📅 *Data:* ${date}
⏰ *Horário:* ${time}

✅ *Status:* Confirmado

Por favor, chegue com 10 minutos de antecedência.

Aguardamos você! ✂️`;
  }

  private buildClientCancellationMessage(
    appointment: Appointment,
    client?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;

    return `❌ *AGENDAMENTO CANCELADO* ❌

Olá ${client?.name?.split(" ")[0] || "Cliente"}! Seu agendamento foi cancelado:

📅 *Data:* ${date}
⏰ *Horário:* ${time}

ℹ️ Caso precise, faça um novo agendamento.

Agradecemos a compreensão! ✂️`;
  }

  private buildClientRescheduleMessage(
    appointment: Appointment,
    service?: Product,
    client?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const serviceName = service?.name || appointment.service?.name || "Serviço";
    const barberName = "Barbeiro";

    return `📅 *AGENDAMENTO REAGENDADO* 📅

Olá ${client?.name?.split(" ")[0] || "Cliente"}! Seu agendamento foi reagendado:

🔄 *Novo horário:*
✂️ *Serviço:* ${serviceName}
👤 *Barbeiro:* ${barberName}
📅 *Data:* ${date}
⏰ *Horário:* ${time}

ℹ️ *Status:* Aguardando confirmação

Aguardamos a nova confirmação do barbeiro. ✂️`;
  }

  private buildClientReminderMessage(
    appointment: Appointment,
    client?: User,
  ): string {
    const date = formatDate(appointment.appointment_date);
    const time = appointment.appointment_time;
    const serviceName = appointment.service?.name || "Serviço";
    const barberName = "Barbeiro";

    return `⏰ *LEMBRETE* ⏰

Olá ${client?.name?.split(" ")[0] || "Cliente"}! Amanhã você tem um agendamento:

✂️ *Serviço:* ${serviceName}
👤 *Barbeiro:* ${barberName}
📅 *Data:* ${date}
⏰ *Horário:* ${time}

✅ *Status:* Confirmado

Não se esqueça! Estamos te esperando! ✂️`;
  }
}

export const notificationService = new NotificationService();
