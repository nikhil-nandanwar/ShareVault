import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isCompleted?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, isCompleted, disabled, children, onClick, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isCompleted && !isLoading) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }
      if (onClick) {
        onClick(e);
      }
    };

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 hover:scale-[1.02]";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700/95 focus:ring-blue-500",
      secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50/95 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700/95 focus:ring-red-500",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100/95 focus:ring-gray-500",
      success: "bg-green-600 text-white hover:bg-green-700/95 focus:ring-green-500",
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    const loadingStyles = isLoading ? "opacity-80 cursor-wait" : "";
    const completedStyles = showSuccess ? "ring-2 ring-green-500 ring-offset-2 button-success" : "";
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], loadingStyles, completedStyles, className)}
        disabled={disabled || isLoading}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {showSuccess && !isLoading && (
          <svg
            className="mr-2 h-4 w-4 text-green-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
