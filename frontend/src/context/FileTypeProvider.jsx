import { useMemo, useState } from 'react';
import { FileTypeContext } from './FileTypeContext';

export function FileTypeProvider({ children }) {
    const [fileType, setFileType] = useState('Text');
    const value = useMemo(() => ({ fileType, setFileType }), [fileType]);

    return (
        <FileTypeContext.Provider value={value}>
            {children}
        </FileTypeContext.Provider>
    );
}

export default FileTypeProvider;
