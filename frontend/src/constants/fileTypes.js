export const ALLOWED_FILE_TYPES = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.tif', '.ico', '.heic', '.heif'],
    video: ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.3gp', '.m4v'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma', '.aiff'],
    document: [
        // Word / text
        '.pdf', '.doc', '.docx', '.docm', '.docb', '.dot', '.dotx', '.dotm',
        '.txt', '.rtf', '.odt', '.ott', '.fodt', '.md', '.csv', '.xml', '.json',
        '.wps', '.wpt',                                      // WPS Writer
        '.pages',                                            // Apple Pages
        '.epub',
        // Excel / spreadsheets
        '.xls', '.xlsx', '.xlsm', '.xlsb', '.xlw',
        '.xlt', '.xltx', '.xltm', '.xla', '.xlam',
        '.ods', '.ots', '.fods',                             // OpenDocument
        '.et', '.ett',                                       // WPS Spreadsheet
        '.numbers',                                          // Apple Numbers
        // PowerPoint / presentations
        '.ppt', '.pptx', '.pptm',
        '.ppsx', '.ppsm', '.pps',
        '.pot', '.potx', '.potm',
        '.odp', '.otp', '.fodp',                             // OpenDocument
        '.dps', '.dpt', '.wpp',                              // WPS Presentation
        '.key',                                              // Apple Keynote
    ],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
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
