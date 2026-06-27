// src/components/Common/Spinner.tsx
import {
  SyncLoader,
  ClipLoader,
  PulseLoader,
  BeatLoader,
} from "react-spinners";
import { ScissorsIcon } from "@phosphor-icons/react";

interface SpinnerProps {
  color?: string;
  size?: number;
  loading?: boolean;
  className?: string;
  variant?: "sync" | "clip" | "pulse" | "beat";
  withLogo?: boolean;
  text?: string;
  textClassName?: string;
  /**
   * Tamanho do spinner em mobile (padrão: 'md')
   */
  mobileSize?: "sm" | "md" | "lg";
}

export const Spinner = ({
  color = "#C9A84C",
  size = 12,
  loading = true,
  className = "",
  variant = "sync",
  withLogo = false,
  text,
  textClassName = "",
  mobileSize = "md",
}: SpinnerProps) => {
  if (!loading) return null;

  // ✅ Tamanhos otimizados para mobile
  const sizeMap = {
    sm: {
      spinner: size * 1.5,
      logo: 12,
      container: "w-12 h-12",
      border: "w-18 h-18",
      innerBorder: "w-14 h-14",
      text: "text-xs",
    },
    md: {
      spinner: size * 2,
      logo: 16,
      container: "w-16 h-16",
      border: "w-24 h-24",
      innerBorder: "w-20 h-20",
      text: "text-sm",
    },
    lg: {
      spinner: size * 2.5,
      logo: 20,
      container: "w-20 h-20",
      border: "w-28 h-28",
      innerBorder: "w-24 h-24",
      text: "text-base",
    },
  };

  const currentSize = sizeMap[mobileSize];

  const renderSpinner = () => {
    const spinnerSize = currentSize.spinner;
    switch (variant) {
      case "clip":
        return <ClipLoader color={color} size={spinnerSize} />;
      case "pulse":
        return <PulseLoader color={color} size={size} />;
      case "beat":
        return <BeatLoader color={color} size={size} />;
      default:
        return <SyncLoader color={color} size={size} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 sm:p-4 ${className}`}
    >
      {withLogo ? (
        <div className="relative flex items-center justify-center">
          {/* ✅ Fundo com glow */}
          <div className="absolute inset-0 bg-accent/5 rounded-full blur-2xl scale-150" />

          {/* ✅ Logo central */}
          <div
            className={`relative z-10 bg-primary-light rounded-2xl border-2 border-accent/20 flex items-center justify-center shadow-glow ${currentSize.container}`}
          >
            <ScissorsIcon
              size={currentSize.logo}
              className="text-accent"
              weight="fill"
            />
          </div>

          {/* ✅ Spinner ao redor da logo */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div
              className={`rounded-full border-3 border-transparent border-t-accent/60 animate-spin ${currentSize.border}`}
            />
            <div
              className={`absolute rounded-full border-3 border-transparent border-b-accent/30 animate-spin animation-delay-500 ${currentSize.innerBorder}`}
            />
          </div>
        </div>
      ) : (
        renderSpinner()
      )}

      {text && (
        <p
          className={`mt-3 sm:mt-4 text-text-muted font-medium animate-pulse ${currentSize.text} ${textClassName}`}
        >
          {text}
        </p>
      )}
    </div>
  );
};
