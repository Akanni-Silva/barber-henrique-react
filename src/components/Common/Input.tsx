// src/components/Common/Input.tsx
import React, { forwardRef, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      type = "text",
      disabled = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 
              bg-primary border rounded-lg 
              text-text placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent/50 
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon && iconPosition === "left" ? "pl-11" : ""}
              ${isPassword ? "pr-11" : ""}
              ${error ? "border-red-500 focus:ring-red-500/50" : "border-border hover:border-border-light"}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text transition"
            >
              {showPassword ? (
                <EyeSlashIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
