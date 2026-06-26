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
}: SpinnerProps) => {
  if (!loading) return null;

  const renderSpinner = () => {
    switch (variant) {
      case "clip":
        return <ClipLoader color={color} size={size * 2.5} />;
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
      className={`flex flex-col items-center justify-center p-4 ${className}`}
    >
      {withLogo ? (
        <div className="relative flex items-center justify-center">
          {/* ✅ Fundo com glow */}
          <div className="absolute inset-0 bg-accent/5 rounded-full blur-2xl scale-150" />

          {/* ✅ Logo central */}
          <div className="relative z-10 w-16 h-16 bg-primary-light rounded-2xl border-2 border-accent/20 flex items-center justify-center shadow-glow">
            <ScissorsIcon size={32} className="text-accent" weight="fill" />
          </div>

          {/* ✅ Spinner ao redor da logo */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-3 border-transparent border-t-accent/60 animate-spin" />
            <div className="absolute w-20 h-20 rounded-full border-3 border-transparent border-b-accent/30 animate-spin animation-delay-500" />
          </div>
        </div>
      ) : (
        renderSpinner()
      )}

      {text && (
        <p
          className={`mt-4 text-sm text-text-muted font-medium animate-pulse ${textClassName}`}
        >
          {text}
        </p>
      )}
    </div>
  );
};
