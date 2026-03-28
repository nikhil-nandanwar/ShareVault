export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';

export const ENDPOINTS = {
    UPLOAD_TEXT: '/upload/text',
    UPLOAD_FILE: '/upload/file',
    GET_CONTENT: (code) => `/content/${code}`,
    DOWNLOAD_FILE: (code, fileIndex) => `/download/${code}/${fileIndex}`,
};
