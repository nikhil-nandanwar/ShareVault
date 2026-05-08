import { createContext, useContext } from 'react';

export const FileTypeContext = createContext(null);

export function useFileType() {
    const context = useContext(FileTypeContext);
    if (!context) {
        throw new Error('useFileType must be used within a FileTypeProvider');
    }
    return context;
}
