import React from 'react';

export const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
    min,
    helperText,
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative rounded-md shadow-sm">
                <input
                    type={type}
                    name={name}
                    id={name}
                    className="block w-full px-4 py-2.5 rounded-lg border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200 ease-in-out hover:border-gray-400"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    min={min}
                    {...props}
                />
            </div>
            {helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
