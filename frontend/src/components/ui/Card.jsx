export function Card({ as: Tag = 'div', className = '', children, ...props }) {
    return (
        <Tag
            className={[
                'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_1px_3px_rgb(15_23_42_/_0.06)]',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </Tag>
    );
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div
            className={['flex flex-col gap-1.5 p-6 pb-4', className].join(' ')}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className = '', children, ...props }) {
    return (
        <h2
            className={[
                'text-lg font-semibold tracking-tight text-slate-900 sm:text-xl',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </h2>
    );
}

export function CardDescription({ className = '', children, ...props }) {
    return (
        <p
            className={['text-sm text-slate-500', className].join(' ')}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({ className = '', children, ...props }) {
    return (
        <div className={['p-6 pt-2', className].join(' ')} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = '', children, ...props }) {
    return (
        <div
            className={[
                'flex items-center gap-3 border-t border-slate-100 px-6 py-4',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
