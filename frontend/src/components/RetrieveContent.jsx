import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

const RetrieveContent = () => {
    const [code, setCode] = useState('');
    const [content, setContent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 4) {
            setError('Please enter a valid 4-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.get(API_BASE_URL + ENDPOINTS.GET_CONTENT(code));
            setContent(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to retrieve content');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (fileIndex, filename) => {
        try {
            setError('');
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.DOWNLOAD_FILE(code, fileIndex)}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let downloadName = filename || 'downloaded-file';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    downloadName = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            link.setAttribute('download', decodeURIComponent(downloadName));
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            setError(error.response?.data?.error || 'Failed to download file. Please try again.');
        }
    };

    const getFileSize = (size) => {
        if (!size) return '';
        if (size < 1024) return size + ' B';
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
        if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="container mx-auto px-4 mt-8"
        >
            <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500">
                <div className="relative rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-8">
                    <div className="animate-float mb-6">
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                            Retrieve Shared Content
                        </h2>
                        <p className="text-gray-600">Enter the 4-digit code to access shared content</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="Enter 4-digit code"
                                className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-700 placeholder-gray-400 text-center text-2xl tracking-widest"
                                maxLength={4}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Retrieving...' : 'Retrieve Content'}
                            </motion.button>
                        </div>
                    </form>

                    {content && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Retrieved Content</h3>
                            {content.type === 'text' ? (
                                <div className="relative p-4 bg-gray-50 rounded-lg">
                                    <pre className="whitespace-pre-wrap break-words text-gray-800">
                                        {content.content}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(content.content)}
                                        className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 rounded-lg border border-gray-300 shadow-sm transition-colors"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {content.files && content.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                            <div className='w-1/2 overflow-hidden'>
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                                                <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(index, file.filename)}
                                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RetrieveContent;
