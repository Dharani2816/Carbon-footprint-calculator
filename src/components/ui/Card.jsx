import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge(
                'bg-white overflow-hidden shadow rounded-lg border border-gray-100',
                className
            )}
            {...props}
        >
            <div className="px-4 py-5 sm:p-6">{children}</div>
        </div>
    );
}
