import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "w-full font-label-md text-label-md py-md px-lg rounded-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center font-medium duration-150";
  const variants = {
    primary:
      "bg-primary hover:bg-surface-tint text-on-primary",
    secondary:
      "bg-surface-container-highest hover:bg-surface-container-high text-on-surface border border-outline-variant/15",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
