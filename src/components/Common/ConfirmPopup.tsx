/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Common/ConfirmPopup.tsx
import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import {
  XIcon,
  TrashIcon,
  CheckIcon,
  WarningIcon,
} from "@phosphor-icons/react";

interface ConfirmPopupProps {
  trigger: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  trigger,
  onConfirm,
  onCancel,
  title = "Confirmar Ação",
  message = "Tem certeza que deseja realizar esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  icon,
  isLoading = false,
  disabled = false,
}) => {
  // Variantes de cores
  const variants = {
    danger: {
      button: "bg-red-500 hover:bg-red-600",
      border: "border-red-500/30",
      icon: "text-red-500",
    },
    warning: {
      button: "bg-yellow-500 hover:bg-yellow-600",
      border: "border-yellow-500/30",
      icon: "text-yellow-500",
    },
    info: {
      button: "bg-blue-500 hover:bg-blue-600",
      border: "border-blue-500/30",
      icon: "text-blue-500",
    },
    success: {
      button: "bg-green-500 hover:bg-green-600",
      border: "border-green-500/30",
      icon: "text-green-500",
    },
  };

  const currentVariant = variants[variant];

  const defaultIcon = {
    danger: <TrashIcon size={32} className="text-red-500" />,
    warning: <WarningIcon size={32} className="text-yellow-500" />,
    info: <WarningIcon size={32} className="text-blue-500" />,
    success: <CheckIcon size={32} className="text-green-500" />,
  };

  const finalIcon = icon || defaultIcon[variant];

  // ✅ Conteúdo do popup
  const PopupContent: React.FC<{ close: () => void }> = ({ close }) => (
    <div className="p-6">
      {/* Cabeçalho com ícone */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full bg-${variant}-500/10 ${currentVariant.border}`}
          >
            {finalIcon}
          </div>
          <h3 className="font-serif text-xl font-bold text-text">{title}</h3>
        </div>
        <button
          onClick={close}
          className="text-text-muted hover:text-text transition p-1 rounded-lg hover:bg-primary-light"
          disabled={isLoading}
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Mensagem */}
      <div className="mb-6">
        <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => {
            onCancel?.();
            close();
          }}
          disabled={isLoading}
          className="px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            // Não fechamos o popup aqui para mostrar loading
          }}
          disabled={isLoading || disabled}
          className={`px-4 py-2 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${currentVariant.button}`}
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              {variant === "danger" && <TrashIcon size={16} />}
              {variant === "success" && <CheckIcon size={16} />}
              {variant === "warning" && <WarningIcon size={16} />}
              {confirmText}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Popup
      trigger={trigger}
      modal
      nested
      closeOnDocumentClick={!isLoading}
      disabled={disabled}
      contentStyle={{
        borderRadius: "12px",
        padding: "0",
        maxWidth: "420px",
        width: "90%",
        backgroundColor: "#1A1A1A",
        border: "1px solid #3D3D3D",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
      }}
      overlayStyle={{
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* ✅ Usando children como função */}
      {PopupContent as any}
    </Popup>
  );
};
