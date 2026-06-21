// src/components/Common/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-accent text-primary-dark hover:bg-accent-hover shadow-gold hover:shadow-gold-lg",
    secondary:
      "border border-accent text-accent hover:bg-accent hover:text-primary-dark",
    outline:
      "border border-border text-text-secondary hover:border-accent hover:text-accent",
    gold: "bg-gradient-gold text-primary-dark hover:opacity-90",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`
        font-semibold rounded-lg transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
