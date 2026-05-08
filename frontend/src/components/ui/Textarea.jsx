import React from 'react';

const Textarea = React.forwardRef(function Textarea(
    { className = '', invalid = false, ...props },
    ref,
) {
    return (
        <textarea
            ref={ref}
            className={[
                'w-full rounded-lg border bg-white p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400',
                'transition-colors duration-150 resize-none',
                'focus:outline-none focus:ring-4 focus:ring-indigo-500/15',
                invalid
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-indigo-500',
                className,
            ].join(' ')}
            {...props}
        />
    );
});

export default Textarea;
