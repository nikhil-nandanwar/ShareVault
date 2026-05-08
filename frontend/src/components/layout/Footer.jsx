import Logo from './Logo';

function Footer() {
    return (
        <footer className="mt-16 border-t border-slate-200/70 bg-white/60">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                <Logo />
                <p className="text-center sm:text-right">
                    &copy; {new Date().getFullYear()} ShareVault. Built for fast,
                    code-based sharing.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
