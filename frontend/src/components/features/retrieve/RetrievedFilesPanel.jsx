import { useState } from 'react';
import { Button, Icon } from '../../ui';
import { formatBytes } from '../../../utils/formatBytes';
import { downloadFile } from '../../../services/shareService';

function RetrievedFilesPanel({ code, files, onError }) {
    const [downloadingIndex, setDownloadingIndex] = useState(null);

    const handleDownload = async (index, filename) => {
        setDownloadingIndex(index);
        try {
            await downloadFile(code, index, filename);
        } catch (err) {
            onError?.(err.message);
        } finally {
            setDownloadingIndex(null);
        }
    };

    if (!files?.length) return null;

    return (
        <ul className="space-y-2">
            {files.map((file, index) => (
                <li
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Icon name="file" className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                                {file.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                                {formatBytes(file.size)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(index, file.filename)}
                        loading={downloadingIndex === index}
                        leftIcon={
                            downloadingIndex === index ? null : (
                                <Icon name="download" className="h-4 w-4" />
                            )
                        }
                    >
                        Download
                    </Button>
                </li>
            ))}
        </ul>
    );
}

export default RetrievedFilesPanel;
