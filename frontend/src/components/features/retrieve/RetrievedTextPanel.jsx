import { Button, Icon } from '../../ui';
import useCopyToClipboard from '../../../hooks/useCopyToClipboard';

function RetrievedTextPanel({ content }) {
    const { copy, copied } = useCopyToClipboard();

    return (
        <div className="relative rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Shared text
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(content)}
                    leftIcon={
                        <Icon
                            name={copied ? 'check' : 'copy'}
                            className={['h-4 w-4', copied ? 'text-emerald-600' : ''].join(' ')}
                        />
                    }
                >
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-slate-800">
                {content}
            </pre>
        </div>
    );
}

export default RetrievedTextPanel;
