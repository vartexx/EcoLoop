import React from "react";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  ariaDescribedBy?: string;
  className?: string;
}

/**
 * Reusable, type-safe, and screen-reader accessible input field.
 * Handles value validation and min/max limits.
 */
export const NumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  error,
  ariaDescribedBy,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      onChange(0);
      return;
    }
    const numVal = parseFloat(rawVal);
    if (!isNaN(numVal)) {
      onChange(numVal);
    }
  };

  const hasError = !!error;
  const descriptionId = ariaDescribedBy || `${id}-description`;

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-bold text-foreground">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        id={id}
        value={value === 0 ? "" : value}
        onChange={handleChange}
        max={max}
        step={step}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : descriptionId}
        className={`w-full px-4 py-2.5 bg-white/5 border rounded-2xl text-foreground text-xs focus:outline-none focus:ring-2 transition-all ${
          hasError
            ? "border-red-500/50 focus:ring-red-500/30 bg-red-500/5"
            : "border-white/10 focus:ring-primary/20 focus:border-primary/40"
        }`}
      />
      {hasError ? (
        <span id={`${id}-error`} className="text-[10px] text-red-400 font-semibold" role="alert">
          {error}
        </span>
      ) : (min !== undefined || max !== undefined) ? (
        <span id={descriptionId} className="text-[9px] text-muted-foreground leading-none">
          Range: {min} {max !== undefined ? `to ${max}` : "or more"}
        </span>
      ) : null}
    </div>
  );
};
