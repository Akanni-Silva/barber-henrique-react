/* eslint-disable @typescript-eslint/no-unused-vars */
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
  QuestionIcon,
} from "@phosphor-icons/react";

interface ConfirmPopupProps {
  trigger: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success" | "neutral";
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
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
  size = "md",
}) => {
  // ✅ Variantes de cores com estilo mobile
  const variants = {
    danger: {
      button: "bg-red-500 hover:bg-red-600 active:scale-[0.97]",
      border: "border-red-500/30",
      iconBg: "bg-red-500/10",
      icon: "text-red-500",
    },
    warning: {
      button: "bg-yellow-500 hover:bg-yellow-600 active:scale-[0.97]",
      border: "border-yellow-500/30",
      iconBg: "bg-yellow-500/10",
      icon: "text-yellow-500",
    },
    info: {
      button: "bg-blue-500 hover:bg-blue-600 active:scale-[0.97]",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/10",
      icon: "text-blue-500",
    },
    success: {
      button: "bg-green-500 hover:bg-green-600 active:scale-[0.97]",
      border: "border-green-500/30",
      iconBg: "bg-green-500/10",
      icon: "text-green-500",
    },
    neutral: {
      button: "bg-accent hover:bg-accent-light active:scale-[0.97]",
      border: "border-accent/30",
      iconBg: "bg-accent/10",
      icon: "text-accent",
    },
  };

  // ✅ Tamanhos do modal
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const currentVariant = variants[variant];

  const defaultIcon = {
    danger: <TrashIcon size={28} className="text-red-500" weight="bold" />,
    warning: (
      <WarningIcon size={28} className="text-yellow-500" weight="bold" />
    ),
    info: <QuestionIcon size={28} className="text-blue-500" weight="bold" />,
    success: <CheckIcon size={28} className="text-green-500" weight="bold" />,
    neutral: <QuestionIcon size={28} className="text-accent" weight="bold" />,
  };

  const finalIcon = icon || defaultIcon[variant];

  // ✅ Conteúdo do popup
  const PopupContent: React.FC<{ close: () => void }> = ({ close }) => (
    <div className="p-6">
      {/* ✅ Cabeçalho com ícone - Mobile First */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentVariant.iconBg} border ${currentVariant.border}`}
          >
            {finalIcon}
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-text leading-tight">
            {title}
          </h3>
        </div>
        <button
          onClick={close}
          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition rounded-lg hover:bg-primary-light"
          disabled={isLoading}
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* ✅ Mensagem */}
      <div className="mb-6">
        <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
      </div>

      {/* ✅ Botões de ação - Mobile First (coluna em telas pequenas) */}
      <div className="flex flex-col-reverse sm:flex-row gap-2.5 justify-end">
        <button
          onClick={() => {
            onCancel?.();
            close();
          }}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 text-text-secondary hover:text-text transition border border-border rounded-xl hover:border-border-light disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
          }}
          disabled={isLoading || disabled}
          className={`w-full sm:w-auto px-5 py-2.5 text-white rounded-xl transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${currentVariant.button}`}
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
              {variant === "info" && <QuestionIcon size={16} />}
              {variant === "neutral" && <QuestionIcon size={16} />}
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
      closeOnDocumentClick={!isLoading && !disabled}
      disabled={disabled}
      contentStyle={{
        borderRadius: "16px",
        padding: "0",
        maxWidth: "440px",
        width: "92%",
        backgroundColor: "#1A1A1A",
        border: "1px solid #2A2A2A",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
        margin: "16px",
      }}
      overlayStyle={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {PopupContent as any}
    </Popup>
  );
};
