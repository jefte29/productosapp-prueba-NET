import React from "react";

interface FooterProps {
  className?: string;
  text?: string;
}

export function Footer({
  className = "",
  text = `© ${new Date().getFullYear()} Gestión de Productos Inc. Todos los derechos reservados. PRUEBA TÉCNICA-1.`,
}: FooterProps) {
  return (
    <footer
      className={`w-full border-t border-outline-variant bg-surface-container-lowest px-3 py-4 text-center sm:px-6 sm:py-5 md:px-8 md:py-6 ${className}`.trim()}
    >
      <p className="mx-auto max-w-4xl whitespace-nowrap text-[11px] leading-relaxed text-outline sm:text-sm md:text-[13px]">
        {text}
      </p>
    </footer>
  );
}
