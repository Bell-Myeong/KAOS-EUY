export const UPLOAD_BUCKET = 'uploads';
export const MAX_FILE_COUNT = 10;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf', 'svg', 'ai'] as const;
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'image/svg+xml',
  'application/postscript',
] as const;

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function isAllowedExtension(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number]);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
}

export function sanitizeFileName(fileName: string): string {
  const normalized = fileName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  const safe = normalized.length > 0 ? normalized : 'file';
  return safe.slice(0, 120);
}
