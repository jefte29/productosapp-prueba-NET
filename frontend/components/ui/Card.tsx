import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#e5e7eb] rounded-xl p-md sm:p-lg md:p-xl shadow-sm transition-transform duration-200 w-full flex flex-col items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
