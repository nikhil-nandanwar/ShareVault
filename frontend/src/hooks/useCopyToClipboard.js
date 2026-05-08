import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCopyToClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    const copy = useCallback(
        async (text) => {
            try {
                await navigator.clipboard.writeText(String(text));
                setCopied(true);
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setCopied(false), timeout);
                return true;
            } catch (err) {
                console.error('Clipboard write failed', err);
                return false;
            }
        },
        [timeout],
    );

    useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

    return { copy, copied };
}
