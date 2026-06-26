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
  variant?: "default" | "rounded" | "circular" | "card";
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

  // Variantes de container
  const variants = {
    default: "",
    rounded: "bg-accent/10 rounded-xl p-2",
    circular: "bg-accent/10 rounded-full p-2.5",
    card: "bg-accent/10 rounded-2xl p-3 border border-accent/10",
  };

  // Fallback caso o ícone não exista
  if (!IconComponent) {
    return (
      <div
        className={`flex items-center justify-center ${variants[variant]} ${className}`}
      >
        <span style={{ fontSize: size }}>📌</span>
        {showLabel && (
          <span
            className={`ml-2 text-xs font-medium text-text ${labelClassName}`}
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
          className={`ml-2 text-xs font-medium text-text ${labelClassName}`}
        >
          {categoryLabel}
        </span>
      )}
    </div>
  );
};
