// src/components/Common/LogoutButton.tsx
import { useLogout } from "../../hooks/useLogout";
import { ConfirmPopup } from "./ConfirmPopup";
import { SignOutIcon } from "@phosphor-icons/react";

interface LogoutButtonProps {
  /**
   * Se true, mostra apenas o ícone
   */
  iconOnly?: boolean;
  /**
   * Texto do botão
   */
  label?: string;
  /**
   * Tamanho do botão
   */
  size?: "sm" | "md" | "lg";
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Rota para redirecionar após logout
   */
  redirectTo?: string;
  /**
   * Mensagem de confirmação
   */
  confirmMessage?: string;
}

export const LogoutButton = ({
  iconOnly = false,
  label = "Sair",
  size = "md",
  className = "",
  redirectTo = "/",
  confirmMessage = "Tem certeza que deseja sair da sua conta?",
}: LogoutButtonProps) => {
  const { logout, isLoggingOut } = useLogout({
    redirectTo,
    successMessage: "👋 Até logo!",
    showToast: true,
  });

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <ConfirmPopup
      trigger={
        <button
          className={`flex items-center gap-2 rounded-lg transition-all duration-200 text-red-500 hover:bg-red-500/10 ${sizeClasses[size]} ${className}`}
          disabled={isLoggingOut}
        >
          <SignOutIcon size={iconSizes[size]} />
          {!iconOnly && label}
          {isLoggingOut && <span className="ml-2">...</span>}
        </button>
      }
      onConfirm={logout}
      title="Sair da conta"
      message={confirmMessage}
      confirmText="Sair"
      cancelText="Cancelar"
      variant="danger"
      size="sm"
    />
  );
};
