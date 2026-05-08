import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
    primary:
        'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm disabled:bg-slate-400',
    secondary:
        'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-sm',
    ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    brand:
        'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm disabled:bg-indigo-300',
    danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
};

const SIZES = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 p-0',
};

const Button = React.forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        className = '',
        disabled = false,
        loading = false,
        leftIcon,
        rightIcon,
        children,
        ...props
    },
    ref,
) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            ref={ref}
            whileHover={isDisabled ? undefined : { y: -1 }}
            whileTap={isDisabled ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            disabled={isDisabled}
            className={[
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
                VARIANTS[variant],
                SIZES[size],
                className,
            ].join(' ')}
            {...props}
        >
            {loading ? (
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
                leftIcon
            )}
            {children}
            {!loading && rightIcon}
        </motion.button>
    );
});

export default Button;
