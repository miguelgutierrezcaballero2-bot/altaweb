"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    color: "#fff",
    border: "none",
  },
  secondary: {
    background: "var(--color-bg-elevated, #18181b)",
    color: "var(--color-text, #fafafa)",
    border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text, #fafafa)",
    border: "1px solid var(--color-border-hover, rgba(255,255,255,0.16))",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary, #a1a1aa)",
    border: "none",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "13px", borderRadius: "8px" },
  md: { padding: "12px 24px", fontSize: "15px", borderRadius: "12px" },
  lg: { padding: "16px 32px", fontSize: "16px", borderRadius: "14px" },
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  style,
  ...props
}: ButtonProps) => {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        width: fullWidth ? "100%" : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-1px)";
        el.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
      {...props}
    >
      {children}
    </button>
  );
};
