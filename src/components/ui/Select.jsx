import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
    label,
    name,
    value,
    onChange,
    options,
    children,
    required = false,
    className = '',
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
                <select
                    name={name}
                    id={name}
                    className="block w-full pl-4 pr-10 py-2.5 rounded-lg border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500 sm:text-sm appearance-none bg-white transition-colors duration-200 ease-in-out hover:border-gray-400"
                    value={value}
                    onChange={onChange}
                    required={required}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
            {helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
