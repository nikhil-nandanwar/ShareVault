export const ALLOWED_FILE_TYPES = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    video: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.ppt', '.pptx'],
    archive: ['.zip'],
};

export const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flat();

export const ACCEPT_ATTRIBUTE = ALL_ALLOWED_EXTENSIONS.join(',');

export function getFileExtension(file) {
    return '.' + file.name.split('.').pop().toLowerCase();
}

export function getFileCategory(file) {
    const ext = getFileExtension(file);
    for (const [category, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
        if (extensions.includes(ext)) return category;
    }
    return 'document';
}

export function isFileAllowed(file) {
    return ALL_ALLOWED_EXTENSIONS.includes(getFileExtension(file));
}
