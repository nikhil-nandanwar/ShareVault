
function Logo({ className = '' }) {
    return (
        <div className={['flex items-center gap-2.5', className].join(' ')}>
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                >
                    <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
                ShareVault
            </span>
        </div>
    );
}

export default Logo;
