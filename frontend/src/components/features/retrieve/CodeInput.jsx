import { useEffect, useRef } from 'react';

export const CODE_LENGTH = 4;

function CodeInput({ value, onChange, autoFocus = true, disabled = false }) {
    const LENGTH = CODE_LENGTH;
    const inputs = useRef([]);

    useEffect(() => {
        if (autoFocus) inputs.current[0]?.focus();
    }, [autoFocus]);

    const setDigit = (index, digit) => {
        const next = value.split('');
        next[index] = digit;
        onChange(next.join('').slice(0, LENGTH));
    };

    const handleChange = (index, raw) => {
        const digit = raw.replace(/\D/g, '').slice(-1);
        if (!digit) return;
        setDigit(index, digit);
        if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (value[index]) {
                setDigit(index, '');
            } else if (index > 0) {
                inputs.current[index - 1]?.focus();
                const next = value.split('');
                next[index - 1] = '';
                onChange(next.join(''));
            }
        }
        if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < LENGTH - 1) inputs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
        if (!pasted) return;
        onChange(pasted.padEnd(LENGTH, '').trimEnd());
        const last = Math.min(pasted.length, LENGTH - 1);
        inputs.current[last]?.focus();
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {Array.from({ length: LENGTH }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    disabled={disabled}
                    value={value[i] ?? ''}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`Digit ${i + 1}`}
                    className={[
                        'h-16 w-14 rounded-xl border bg-white text-center font-mono text-3xl font-bold text-slate-900',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-4 focus:ring-indigo-500/15',
                        value[i]
                            ? 'border-indigo-400 focus:border-indigo-500'
                            : 'border-slate-200 focus:border-indigo-500',
                        'sm:h-20 sm:w-16 sm:text-4xl',
                    ].join(' ')}
                />
            ))}
        </div>
    );
}

export default CodeInput;
