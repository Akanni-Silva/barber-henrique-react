/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/whatsappService.ts
import type { WhatsAppMessage, WhatsAppConfig } from "../types";

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private isEnabled = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem("whatsapp_config");
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.isEnabled = true;
      } else {
        this.config = {
          phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_ID || "",
          accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || "",
          fromPhoneNumber: import.meta.env.VITE_WHATSAPP_FROM_NUMBER || "",
        };
        this.isEnabled = !!(
          this.config.phoneNumberId &&
          this.config.accessToken &&
          this.config.fromPhoneNumber
        );
      }
    } catch (error) {
      console.error("Erro ao carregar configuração do WhatsApp:", error);
      this.isEnabled = false;
    }
  }

  async sendMessage(
    data: WhatsAppMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isEnabled || !this.config) {
      console.warn("⚠️ WhatsApp não configurado. Mensagem não enviada.");
      return {
        success: false,
        error: "WhatsApp não configurado",
      };
    }

    try {
      const formattedNumber = this.formatPhoneNumber(data.to);
      const payload = {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: data.type || "text",
        ...(data.type === "template" && data.templateName
          ? {
              template: {
                name: data.templateName,
                language: { code: "pt_BR" },
                components: data.templateParams
                  ? [
                      {
                        type: "body",
                        parameters: Object.entries(data.templateParams).map(
                          ([key, value]) => ({
                            type: "text",
                            parameter_name: key,
                            text: value,
                          }),
                        ),
                      },
                    ]
                  : [],
              },
            }
          : {
              text: { body: data.message },
            }),
      };

      console.log("📤 Enviando mensagem WhatsApp:", payload);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro WhatsApp API:", result);
        return {
          success: false,
          error: result.error?.message || "Erro ao enviar mensagem WhatsApp",
        };
      }

      console.log("✅ Mensagem WhatsApp enviada:", result);
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error("Erro ao enviar mensagem WhatsApp:", error);
      return {
        success: false,
        error: error.message || "Erro ao enviar mensagem WhatsApp",
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith("55")) {
      cleaned = `55${cleaned}`;
    }
    return cleaned;
  }

  configure(config: WhatsAppConfig): void {
    this.config = config;
    this.isEnabled = true;
    localStorage.setItem("whatsapp_config", JSON.stringify(config));
  }

  isConfigured(): boolean {
    return this.isEnabled && !!this.config;
  }

  getConfig(): WhatsAppConfig | null {
    return this.config;
  }

  disable(): void {
    this.isEnabled = false;
    this.config = null;
    localStorage.removeItem("whatsapp_config");
  }

  async testConnection(phoneNumber: string): Promise<boolean> {
    if (!this.isEnabled || !this.config) {
      return false;
    }

    const result = await this.sendMessage({
      to: phoneNumber,
      message: "🔔 Teste de conexão WhatsApp - Barbearia",
      type: "text",
    });

    return result.success;
  }
}

export const whatsappService = new WhatsAppService();
