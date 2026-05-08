import { motion } from 'framer-motion';
import Button from './Button';
import { Icon } from './Icon';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

function CodeDisplay({ code, label = 'Your sharing code', helpText }) {
    const { copy, copied } = useCopyToClipboard();
    const digits = String(code).split('');

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center"
        >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
                {digits.map((digit, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex h-14 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white font-mono text-3xl font-bold text-slate-900 shadow-sm sm:h-16 sm:w-14 sm:text-4xl"
                    >
                        {digit}
                    </motion.div>
                ))}
            </div>

            {helpText && (
                <p className="mt-4 text-sm text-slate-500">{helpText}</p>
            )}

            <div className="mt-5 flex justify-center">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copy(code)}
                    leftIcon={
                        <Icon
                            name={copied ? 'check' : 'copy'}
                            className={['h-4 w-4', copied ? 'text-emerald-600' : ''].join(' ')}
                        />
                    }
                >
                    {copied ? 'Copied' : 'Copy code'}
                </Button>
            </div>
        </motion.div>
    );
}

export default CodeDisplay;
