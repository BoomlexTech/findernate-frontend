import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Required props
  id?: string;
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string; // Optional error message
  className?: string; // Optional custom classes for the outermost div wrapper
  inputClassName?: string; // Optional custom classes for the input element itself
  leftIcon?: React.ReactNode;   // New: Icon or node to render on the left
  // 'type', 'disabled', 'readOnly', 'required', 'min', 'max', 'name', etc.
  // are already included via InputHTMLAttributes<HTMLInputElement>
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    className,
    inputClassName,
    leftIcon,
    ...rest
  }: InputProps, ref) => {
    // Tailwind classes for consistent styling
    const baseInputClasses = `
        w-full px-4 py-3 pl-12 pr-20
        text-black placeholder:text-gray-400
        border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-yellow-500 focus:border-transparent
        outline-none transition-all
        sm:text-md
      `;

    // Classes for error state
    const errorInputClasses = error ? `border-red-500 focus:ring-red-500 focus:border-red-500` : '';
    const errorMessageClasses = `mt-1 text-sm text-red-600`;

    // Combine all input classes
    const finalInputClasses = `${baseInputClasses} ${errorInputClasses} ${inputClassName || ''}`.trim();

    return (
      <>
      {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
      <div className={`mb-3 relative ${className || ''}`}> {/* mb-4 for bottom margin, adjust as needed */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={finalInputClasses}
          ref={ref} // Forward the ref
          {...rest} // Spread any other HTML input attributes like 'required', 'disabled', 'min', 'max' etc.
        />
        {error && <p className={errorMessageClasses}>{error}</p>}
      </div>
      </>
    );
  }
);

Input.displayName = 'Input'; // Helps with debugging in React DevTools

export default Input;