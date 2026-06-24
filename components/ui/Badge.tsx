import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div
      ref={ref}
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});
Badge.displayName = "Badge";

export { Badge };
