import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../../ui';
import { formatBytes } from '../../../utils/formatBytes';
import { getFileCategory } from '../../../constants/fileTypes';

const CATEGORY_ICON = {
    image: 'image',
    video: 'video',
    audio: 'audio',
    archive: 'archive',
    document: 'file',
};

const CATEGORY_TINT = {
    image: 'bg-violet-50 text-violet-600',
    video: 'bg-rose-50 text-rose-600',
    audio: 'bg-emerald-50 text-emerald-600',
    archive: 'bg-amber-50 text-amber-700',
    document: 'bg-sky-50 text-sky-600',
};

function FilePreviewItem({ file, onRemove }) {
    const category = getFileCategory(file);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (category !== 'image') return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file, category]);

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
        >
            <div className="flex min-w-0 items-center gap-3">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                ) : (
                    <span
                        className={[
                            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                            CATEGORY_TINT[category],
                        ].join(' ')}
                    >
                        <Icon name={CATEGORY_ICON[category]} className="h-5 w-5" />
                    </span>
                )}

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                        {file.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${file.name}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
            >
                <Icon name="close" className="h-4 w-4" />
            </button>
        </motion.li>
    );
}

export default FilePreviewItem;
