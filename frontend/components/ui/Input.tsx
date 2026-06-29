import React, { forwardRef, useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    return (
      <div className="space-y-xs w-full flex flex-col text-left">
        <label
          htmlFor={id}
          className={`font-label-md text-label-md transition-colors duration-200 ${
            isFocused
              ? "text-primary-container font-semibold"
              : "text-on-surface-variant"
          }`}
        >
          {label}
        </label>
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200 ${
                isFocused ? "text-primary" : "text-outline"
              }`}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full py-md bg-white border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none transition-all duration-200 ${
              leftIcon ? "pl-10" : "px-md"
            } ${rightIcon ? "pr-10" : "pr-md"} ${
              error
                ? "border-error focus:border-error focus:ring-3 focus:ring-error/15"
                : "border-outline-variant focus:border-primary focus:ring-3 focus:ring-primary/15"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-body-sm text-error font-medium mt-xs">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
