/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Common/ServiceIcon.tsx
import React from "react";
import type { ProductCategory } from "../../types";
import {
  categoryPhosphorIcon,
  phosphorIcons,
  categoryLabels,
} from "../../types";

interface ServiceIconProps {
  category: ProductCategory;
  size?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  labelClassName?: string;
  variant?: "default" | "rounded" | "circular" | "card" | "compact";
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  category,
  size = 24,
  className = "",
  color = "currentColor",
  showLabel = false,
  labelClassName = "",
  variant = "default",
}) => {
  // Obter o nome do ícone com base na categoria
  const iconName = categoryPhosphorIcon[category] || "DotsThreeIcon";
  const IconComponent = phosphorIcons[iconName as keyof typeof phosphorIcons];
  const categoryLabel = categoryLabels[category] || category;

  // ✅ Variantes de container otimizadas para mobile
  const variants = {
    default: "",
    rounded: "bg-accent/10 rounded-xl p-2",
    circular: "bg-accent/10 rounded-full p-2",
    card: "bg-accent/10 rounded-2xl p-3 border border-accent/10",
    compact: "bg-accent/10 rounded-lg p-1.5", // ✅ Nova variante compacta
  };

  // ✅ Tamanhos otimizados para mobile
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  };

  // ✅ Tamanho do label baseado no ícone
  const labelSize = size >= 24 ? "text-xs" : "text-[10px]";

  // Fallback caso o ícone não exista
  if (!IconComponent) {
    return (
      <div
        className={`flex items-center justify-center ${variants[variant]} ${className}`}
      >
        <span style={{ fontSize: size }}>📌</span>
        {showLabel && (
          <span
            className={`ml-1.5 font-medium text-text ${labelSize} ${labelClassName}`}
          >
            {categoryLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${variants[variant]} ${className}`}
    >
      <IconComponent size={size} color={color} />
      {showLabel && (
        <span
          className={`ml-1.5 font-medium text-text ${labelSize} ${labelClassName}`}
        >
          {categoryLabel}
        </span>
      )}
    </div>
  );
};
