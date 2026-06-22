// src/components/Common/Spinner.tsx
import { SyncLoader } from "react-spinners";

interface SpinnerProps {
  color?: string;
  size?: number;
  loading?: boolean;
  className?: string;
}

export const Spinner = ({
  color = "#C9A84C", // Cor dourada da marca
  size = 12,
  loading = true,
  className = "",
}: SpinnerProps) => {
  if (!loading) return null;

  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <SyncLoader color={color} size={size} />
    </div>
  );
};
