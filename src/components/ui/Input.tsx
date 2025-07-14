import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Required props
  id: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string; // Optional error message
  className?: string; // Optional custom classes for the outermost div wrapper
  inputClassName?: string; // Optional custom classes for the input element itself
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
    ...rest
  }: InputProps, ref) => {
    // Tailwind classes for consistent styling
    const baseInputClasses = `
      block w-full px-3 py-2
      border border-gray-300 rounded-md
      shadow-sm
      focus:outline-none focus:ring-blue-500 focus:border-blue-500
      sm:text-sm
    `;

    // Classes for error state
    const errorInputClasses = error ? `border-red-500 focus:ring-red-500 focus:border-red-500` : '';
    const errorMessageClasses = `mt-1 text-sm text-red-600`;

    // Combine all input classes
    const finalInputClasses = `${baseInputClasses} ${errorInputClasses} ${inputClassName || ''}`.trim();

    return (
      <div className={`mb-4 ${className || ''}`}> {/* mb-4 for bottom margin, adjust as needed */}
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
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
    );
  }
);

Input.displayName = 'Input'; // Helps with debugging in React DevTools

export default Input;