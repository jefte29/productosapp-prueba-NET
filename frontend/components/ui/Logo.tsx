import React from "react";

interface LogoProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function Logo({
  title = "Gestión de Productos",
  subtitle = "Accede a tu panel administrativo",
  compact = false,
}: LogoProps) {
  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col items-center mb-xl"}>
      {/* Blue square icon matching brand anchor logic */}
      <div className={compact ? "w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm shrink-0" : "w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-md shadow-sm"}>
        {/* SVG representation of inventory_2 icon */}
        <svg
          className={compact ? "w-5 h-5 text-on-primary" : "w-7 h-7 text-on-primary"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      {!compact ? (
        <>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface text-center tracking-tight">
            {title}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            {subtitle}
          </p>
        </>
      ) : (
        <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
          {title}
        </span>
      )}
    </div>
  );
}
