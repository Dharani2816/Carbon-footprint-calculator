import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={twMerge(
                    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border',
                    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
};
