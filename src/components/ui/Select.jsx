import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export const Select = forwardRef(({ className, label, error, options, children, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={twMerge(
                    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white',
                    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

Select.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    children: PropTypes.node,
};
