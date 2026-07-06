/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// src/components/Common/WhatsAppConfig.tsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { whatsappService } from "../../services/whatsappService";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

import type { WhatsAppConfigProps } from "../../types";
import { WhatsappLogoIcon } from "@phosphor-icons/react";

export const WhatsAppConfig = ({
  onConfigured,
  onDisabled,
}: WhatsAppConfigProps) => {
  const [phoneNumberId, setPhoneNumberId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [fromPhoneNumber, setFromPhoneNumber] = useState<string>("");
  const [testNumber, setTestNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    const config = whatsappService.getConfig();
    if (config) {
      setPhoneNumberId(config.phoneNumberId || "");
      setAccessToken(config.accessToken || "");
      setFromPhoneNumber(config.fromPhoneNumber || "");
      setIsConfigured(whatsappService.isConfigured());
    }
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!phoneNumberId || !accessToken || !fromPhoneNumber) {
      toast.warning("⚠️ Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      whatsappService.configure({
        phoneNumberId,
        accessToken,
        fromPhoneNumber,
      });
      setIsConfigured(true);
      toast.success("✅ Configuração do WhatsApp salva com sucesso!");
      onConfigured?.();
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = (): void => {
    whatsappService.disable();
    setIsConfigured(false);
    toast.info("WhatsApp desabilitado");
    onDisabled?.();
  };

  const handleTest = async (): Promise<void> => {
    if (!testNumber) {
      toast.warning("⚠️ Informe um número para teste");
      return;
    }

    setIsTesting(true);
    try {
      const success = await whatsappService.testConnection(testNumber);
      if (success) {
        toast.success("Conexão WhatsApp testada com sucesso!");
      } else {
        toast.error("Falha no teste de conexão");
      }
    } catch (error) {
      toast.error("Erro ao testar conexão");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-primary-light rounded-xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <WhatsappLogoIcon size={28} className="text-green-500" />
        <h2 className="font-serif text-lg font-bold text-text">
          Configuração WhatsApp
        </h2>
        <span
          className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
            isConfigured
              ? "bg-green-500/20 text-green-500"
              : "bg-yellow-500/20 text-yellow-500"
          }`}
        >
          {isConfigured ? "✅ Configurado" : "⚠️ Não configurado"}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Phone Number ID
          </label>
          <input
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="Ex: 123456789012345"
            className="w-full px-3 py-2 bg-primary-light border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            disabled={isConfigured}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Access Token
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Ex: EAA..."
            className="w-full px-3 py-2 bg-primary-light border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            disabled={isConfigured}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Número do WhatsApp (com DDD)
          </label>
          <input
            type="text"
            value={fromPhoneNumber}
            onChange={(e) => setFromPhoneNumber(e.target.value)}
            placeholder="Ex: 5511999999999"
            className="w-full px-3 py-2 bg-primary-light border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            disabled={isConfigured}
          />
        </div>

        {!isConfigured ? (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Spinner size={16} /> : "Salvar Configuração"}
          </Button>
        ) : (
          <Button variant="danger" onClick={handleDisable} className="w-full">
            Desabilitar WhatsApp
          </Button>
        )}

        <div className="border-t border-border/50 pt-4 mt-4">
          <h3 className="text-sm font-medium text-text mb-3">Testar Conexão</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="Número para teste (ex: 5511999999999)"
              className="flex-1 px-3 py-2 bg-primary-light border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={isTesting || !testNumber || !isConfigured}
            >
              {isTesting ? <Spinner size={16} /> : "Testar"}
            </Button>
          </div>
          <p className="text-text-muted text-xs mt-2">
            Envia uma mensagem de teste para o número informado
          </p>
        </div>
      </div>
    </div>
  );
};
