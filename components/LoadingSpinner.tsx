interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
} as const;

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-3 border-gray-100 border-t-blue-600 rounded-full animate-spin`}
    />
  );
}
