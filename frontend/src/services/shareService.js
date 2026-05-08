import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

const client = axios.create({ baseURL: API_BASE_URL });

function extractError(error, fallback) {
    return error?.response?.data?.error || fallback;
}

export async function uploadText(content) {
    try {
        const { data } = await client.post(ENDPOINTS.UPLOAD_TEXT, { content });
        return { code: data.code };
    } catch (error) {
        throw new Error(extractError(error, 'Failed to upload text'));
    }
}

export async function uploadFiles(files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
        const { data } = await client.post(ENDPOINTS.UPLOAD_FILE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { code: data.code };
    } catch (error) {
        throw new Error(extractError(error, 'Failed to upload files'));
    }
}

export async function getContent(code) {
    try {
        const { data } = await client.get(ENDPOINTS.GET_CONTENT(code));
        return data;
    } catch (error) {
        throw new Error(extractError(error, 'Failed to retrieve content'));
    }
}

export async function downloadFile(code, fileIndex, fallbackName = 'downloaded-file') {
    try {
        const response = await client.get(ENDPOINTS.DOWNLOAD_FILE(code, fileIndex), {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);

        let downloadName = fallbackName;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                downloadName = match[1].replace(/['"]/g, '');
            }
        }

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', decodeURIComponent(downloadName));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error(extractError(error, 'Failed to download file. Please try again.'));
    }
}
