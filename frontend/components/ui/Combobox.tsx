import React, { useState, useRef, useEffect } from "react";

export interface ComboboxOption<T extends string | number | boolean | null = string>  {
  value: T;
  label: string;
}

interface ComboboxProps<T extends string | number | boolean = string>  {
  label: string;
  options: ComboboxOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function Combobox<T extends string | number | boolean= string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción...",
  error,
  className = "",
}:ComboboxProps<T>){
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`space-y-xs w-full flex flex-col text-left relative ${className}`} ref={containerRef}>
      <label
        className={`font-label-md text-label-md transition-colors duration-200 ${
          isOpen ? "text-primary-container font-semibold" : "text-on-surface-variant"
        }`}
      >
        {label}
      </label>
      <div
        className={`relative w-full py-md px-md bg-white border rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ${
          error
            ? "border-error focus-within:border-error focus-within:ring-3 focus-within:ring-error/15"
            : "border-outline-variant focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        <span className={`font-body-md text-body-md ${selectedOption ? "text-on-surface" : "text-outline"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-outline-variant rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="py-2 px-3 text-body-sm text-outline">Sin resultados</div>
          ) : (
            options.map((option) => (
              <div
                //key={String{(option.value)}
                key={String(option.value)}
                className={`py-2 px-3 cursor-pointer hover:bg-primary/10 transition-colors duration-150 font-body-md text-body-md ${
                  value === option.value ? "bg-primary/5 text-primary font-medium" : "text-on-surface"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
      
      {error && (
        <span className="text-body-sm text-error font-medium mt-xs">
          {error}
        </span>
      )}
    </div>
  );
};
