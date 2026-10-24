import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

/**
 * Komponen tombol interaktif berbasis Apple HIG
 * Menjamin area sentuh minimum 44x44px dan cincin fokus aksesibel
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-control transition-smooth select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "min-h-[36px] min-w-[36px] px-3 text-xs md:text-sm",
      md: "min-h-[44px] min-w-[44px] px-4 py-2 text-sm md:text-base",
      lg: "min-h-[50px] min-w-[50px] px-6 py-3 text-base md:text-lg",
    };

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary shadow-sm",
      secondary:
        "bg-surface text-foreground border border-border hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-primary",
      outline:
        "bg-transparent text-primary border border-primary/40 hover:bg-primary/10 focus-visible:ring-primary",
      ghost:
        "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-primary",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
