import React from 'react';

export const Button = ({
    children,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button',
    onClick,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 hover:shadow-md transform hover:-translate-y-0.5",
        secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500",
        ghost: "border-transparent text-gray-600 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500 shadow-none",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
