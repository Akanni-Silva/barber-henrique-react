// src/components/Common/Button.tsx
import React from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const variants = {
    primary:
      "bg-accent text-primary-dark hover:bg-accent-light shadow-gold hover:shadow-gold-lg active:scale-[0.98]",
    secondary:
      "bg-primary-light border border-border text-text hover:border-accent/50 hover:bg-accent/5 active:scale-[0.98]",
    outline:
      "bg-transparent border-2 border-accent text-accent hover:bg-accent/10 active:scale-[0.98]",
    gold: "bg-gradient-to-r from-accent-dark via-accent to-accent-light text-primary-dark hover:opacity-90 active:scale-[0.98]",
    ghost:
      "bg-transparent text-text-muted hover:text-text hover:bg-primary-light/50 active:scale-[0.98]",
    danger:
      "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl gap-1.5",
    md: "px-6 py-3 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-2xl gap-2.5",
    xl: "px-10 py-5 text-lg rounded-2xl gap-3",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Spinner
          color={
            variant === "primary" || variant === "gold" ? "#1A1A1A" : "#C9A84C"
          }
          size={size === "sm" ? 8 : size === "md" ? 10 : 12}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
