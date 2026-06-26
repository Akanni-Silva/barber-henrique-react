// src/components/Common/Input.tsx
import React, { forwardRef, type InputHTMLAttributes, useState } from "react";
import { EyeIcon, EyeSlashIcon, XIcon } from "@phosphor-icons/react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  labelClassName?: string;
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
      clearable = false,
      onClear,
      containerClassName = "",
      className = "",
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const hasValue =
      value !== undefined && value !== null && String(value).length > 0;

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      // Se não tiver onClear, podemos simular um evento de change com valor vazio
      if (onChange) {
        const event = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`relative group ${isFocused ? "ring-2 ring-accent/50" : ""}`}
        >
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span
                className={`
                transition-colors duration-200
                ${isFocused ? "text-accent" : "text-text-muted"}
                ${error ? "text-red-400" : ""}
              `}
              >
                {icon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            required={required}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 
              bg-primary border rounded-xl
              text-text placeholder:text-text-muted
              focus:outline-none
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon && iconPosition === "left" ? "pl-11" : ""}
              ${isPassword || (clearable && hasValue) ? "pr-11" : ""}
              ${
                error
                  ? "border-red-500 focus:ring-red-500/50"
                  : isFocused
                    ? "border-accent"
                    : "border-border hover:border-border-light"
              }
              ${className}
            `}
            {...props}
          />

          {/* ✅ Botão de limpar */}
          {clearable && hasValue && !isPassword && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text transition"
              aria-label="Limpar campo"
            >
              <XIcon size={18} />
            </button>
          )}

          {/* ✅ Botão de mostrar senha */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text transition"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeSlashIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
