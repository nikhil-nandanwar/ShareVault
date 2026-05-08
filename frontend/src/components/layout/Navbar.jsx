import { motion } from 'framer-motion';
import { useFileType } from '../../context/FileTypeContext';
import { VIEWS } from '../../constants/views';
import Logo from './Logo';

function Navbar() {
    const { fileType, setFileType } = useFileType();

    return (
        <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md"
        >
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Logo />

                <nav
                    aria-label="Primary"
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
                >
                    {VIEWS.map((view) => {
                        const active = fileType === view.id;
                        return (
                            <button
                                key={view.id}
                                onClick={() => setFileType(view.id)}
                                aria-current={active ? 'page' : undefined}
                                className={[
                                    'relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
                                    active
                                        ? 'text-slate-900'
                                        : 'text-slate-500 hover:text-slate-800',
                                ].join(' ')}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-slate-200"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    />
                                )}
                                <span className="relative inline-flex items-center gap-1.5">
                                    <view.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{view.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </motion.header>
    );
}

export default Navbar;
