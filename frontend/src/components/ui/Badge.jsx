
const VARIANTS = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    brand: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
};

function Badge({ variant = 'neutral', className = '', children, ...props }) {
    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                VARIANTS[variant],
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </span>
    );
}

export default Badge;
