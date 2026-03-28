import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

const FileUploadSection = () => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const fileInputRef = useRef(null);

    const allowedTypes = {
        'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        'video': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
        'audio': ['.mp3', '.wav', '.ogg', '.m4a'],
        'document': ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.ppt', '.pptx']
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return Object.values(allowedTypes).flat().includes(extension);
        });

        if (validFiles.length === 0) {
            setError('Please select valid file types');
            return;
        }

        setFiles(prev => [...prev, ...validFiles]);
        setError('');
    };

    const removeFile = (index) => {
        const file = files[index];
        const icon = getFileIcon(file);
        if (icon.startsWith('blob:')) {
            URL.revokeObjectURL(icon);
        }
        setFiles(prev => prev.filter((_, i) => i !== index));
        setGeneratedCode('');
    };

    const getFileIcon = (file) => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (allowedTypes.image.includes(extension)) {
            return URL.createObjectURL(file); // Return preview URL for images
        }
        if (allowedTypes.video.includes(extension)) return '🎥';
        if (allowedTypes.audio.includes(extension)) return '🎵';
        return '📄';
    };

    const getFileSize = (size) => {
        if (size < 1024) return size + ' B';
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const uploadFiles = async () => {
        if (files.length === 0) {
            setError('Please select files to upload');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axios.post(API_BASE_URL + ENDPOINTS.UPLOAD_FILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setGeneratedCode(response.data.code);
            setFiles([]); // Clear the files after successful upload
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to upload files');
        } finally {
            setLoading(false);
        }
    };

    const FilePreview = ({ file, index }) => {
        const icon = getFileIcon(file);
        const isImage = icon.startsWith('blob:');
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between p-2 mb-2 bg-gray-100 rounded-lg"
            >
                <div className="flex items-center space-x-3">
                    {isImage ? (
                        <img src={icon} alt={file.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                        <span className="text-2xl">{icon}</span>
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
                    </div>
                </div>
                <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                >
                    ✕
                </button>
            </motion.div>
        );
    };

    useEffect(() => {
        return () => {
            files.forEach(file => {
                const icon = getFileIcon(file);
                if (icon.startsWith('blob:')) {
                    URL.revokeObjectURL(icon);
                }
            });
        };
    }, [files]);

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
                            Share Your Files
                        </h2>
                        <p className="text-gray-600">Upload files to get a sharing code</p>
                    </div>

                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                            className="hidden"
                            multiple
                            accept={Object.values(allowedTypes).flat().join(',')}
                        />
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div className="text-gray-600">
                                <span className="font-medium text-indigo-500">Click to upload</span> or drag and drop
                            </div>
                            <div className="text-xs text-gray-500">
                                Supported formats: Image (JPG, PNG, GIF), Video (MP4, AVI, MOV), Audio (MP3, WAV), Documents (PDF, DOC, TXT)
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-red-500 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {files.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Selected Files</h3>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <FilePreview key={index} file={file} index={index} />
                                ))}
                            </div>

                            <div className="flex justify-end mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={uploadFiles}
                                    disabled={loading}
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50"
                                >
                                    {loading ? 'Uploading...' : 'Upload Files'}
                                </motion.button>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {generatedCode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center"
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Sharing Code</h3>
                                <p className="text-4xl font-bold tracking-wider text-indigo-600 mb-2">{generatedCode}</p>
                                <p className="text-sm text-gray-500">Share this code with others to let them access your file</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default FileUploadSection;
